/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { Config, Id64, Id64String, OpenMode } from "@bentley/bentleyjs-core";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { DrawingViewState, IModelApp, IModelConnection, RemoteBriefcaseConnection, SpatialViewState } from "@bentley/imodeljs-frontend";
import { ViewportComponent } from "@bentley/ui-components";
import { Button, ButtonSize, ButtonType, Spinner, SpinnerSize } from "@bentley/ui-core";
import * as React from "react";
import "./App.css";
import Toolbar from "./Toolbar";

// cSpell:ignore imodels

/** React state of the App component */
export interface AppState {
  user: {
    isAuthorized: boolean;
    isLoading: boolean;
  };
  imodel?: IModelConnection;
  viewDefinitionId?: Id64String;
}

/** A component the renders the whole application UI */
export default class App extends React.Component<{}, AppState> {

  /** Creates an App instance */
  constructor(props?: any, context?: any) {
    super(props, context);
    this.state = {
      user: {
        isAuthorized: IModelApp.authorizationClient?.isAuthorized ?? false,
        isLoading: false,
      },
    };
  }

  /** Pick the first available spatial view definition in the imodel */
  private async getFirstViewDefinitionId(imodel: IModelConnection): Promise<Id64String> {
    // Return default view definition (if any)
    const defaultViewId = await imodel.views.queryDefaultViewId();
    if (Id64.isValid(defaultViewId))
      return defaultViewId;

    // Return first spatial view definition (if any)
    const spatialViews: IModelConnection.ViewSpec[] = await imodel.views.getViewList({ from: SpatialViewState.classFullName });
    if (spatialViews.length > 0)
      return spatialViews[0].id!;

    // Return first drawing view definition (if any)
    const drawingViews: IModelConnection.ViewSpec[] = await imodel.views.getViewList({ from: DrawingViewState.classFullName });
    if (drawingViews.length > 0)
      return drawingViews[0].id!;

    throw new Error("No valid view definitions in imodel");
  }

  /** Handle iModel open event */
  private _onIModelSelected = async (imodel: IModelConnection | undefined) => {
    if (!imodel) {
      // reset the state when imodel is closed
      this.setState({ imodel: undefined, viewDefinitionId: undefined });
      return;
    }
    try {
      // attempt to get a view definition
      const viewDefinitionId = await this.getFirstViewDefinitionId(imodel);
      this.setState({ imodel, viewDefinitionId });
    } catch (e) {
      // if failed, close the imodel and reset the state
      await imodel.close();
      this.setState({ imodel: undefined, viewDefinitionId: undefined });
      alert(e.message);
    }
  }

  /** The component's render method */
  public render() {
    let ui: React.ReactNode;

    if (!this.state.imodel || !this.state.viewDefinitionId) {
      // if we don't have an imodel / view definition id - render a button that initiates imodel open
      ui = (<OpenIModelButton onIModelSelected={this._onIModelSelected} />);
    } else {
      // if we do have an imodel and view definition id - render imodel components
      ui = (<IModelComponents imodel={this.state.imodel} viewDefinitionId={this.state.viewDefinitionId} />);
    }

    // render the app
    return (
      <div className="app">
        {ui}
      </div>
    );
  }
}

/** React props for [[OpenIModelButton]] component */
interface OpenIModelButtonProps {
  onIModelSelected: (imodel: IModelConnection | undefined) => void;
}
/** React state for [[OpenIModelButton]] component */
interface OpenIModelButtonState {
  isLoading: boolean;
}
/** Renders a button that opens an iModel identified in configuration */
class OpenIModelButton extends React.PureComponent<OpenIModelButtonProps, OpenIModelButtonState> {
  public state = { isLoading: false };

  /** Gets context and imodel ids from configuration */
  private async getIModelInfo(): Promise<{ contextId: string, imodelId: string }> {
    // iTwinStack: Querying context depends on your implementation and can be different from Context Registry
    // This method just returns ids from config, instead of querying them by names like in basic-viewport-app
    const imodelId = Config.App.get("imjs_test_imodel_id");
    const contextId = Config.App.get("imjs_test_context_id");
    return { contextId, imodelId };
  }

  /** Handle iModel open event */
  private async onIModelSelected(imodel: IModelConnection | undefined) {
    this.props.onIModelSelected(imodel);
    this.setState({ isLoading: false });
  }

  private _onClickOpen = async () => {
    this.setState({ isLoading: true });
    let imodel: IModelConnection | undefined;
    try {
      // attempt to open the imodel
      const info = await this.getIModelInfo();
      imodel = await RemoteBriefcaseConnection.open(info.contextId, info.imodelId, OpenMode.Readonly);
    } catch (e) {
      alert(e.message);
    }
    await this.onIModelSelected(imodel);
  }

  public render() {
    return (
      <div>
        <div>
          <Button size={ButtonSize.Large} buttonType={ButtonType.Primary} className="button-open-imodel" onClick={this._onClickOpen}>
            <span>Open iModel</span>
            {this.state.isLoading ? <span style={{ marginLeft: "8px" }}><Spinner size={SpinnerSize.Small} /></span> : undefined}
          </Button>
        </div>
      </div>
    );
  }
}

/** React props for [[IModelComponents]] component */
interface IModelComponentsProps {
  imodel: IModelConnection;
  viewDefinitionId: Id64String;
}

/** Renders a viewport */
class IModelComponents extends React.PureComponent<IModelComponentsProps> {
  public render() {
    return (
      <>
        <ViewportComponent
          style={{ height: "100vh" }}
          imodel={this.props.imodel}
          viewDefinitionId={this.props.viewDefinitionId} />
        <Toolbar />
      </>
    );
  }
}
