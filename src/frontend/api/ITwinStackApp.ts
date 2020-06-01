/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { ClientRequestContext, Config, Guid } from "@bentley/bentleyjs-core";
import { BentleyCloudRpcManager } from "@bentley/imodeljs-common";
import { IModelApp, IModelAppOptions } from "@bentley/imodeljs-frontend";
import { UiComponents } from "@bentley/ui-components";
import { getSupportedRpcs } from "../../common/rpcs";
import { IModelBankClient } from "@bentley/imodelhub-client";
import { IModelBankBasicAuthorizationClient } from "@bentley/imodelhub-client/lib/imodelbank/IModelBankBasicAuthorizationClient";

// Boiler plate code
export class ITwinStackApp {

  public static async startup() {
    // Setup IModelApp
    const opts: IModelAppOptions = {};

    // iTwinStack: Setup IModelBankClient as imodelClient for the IModelApp
    const url = Config.App.get("imjs_imodelbank_url");
    const imodelClient = new IModelBankClient(url, undefined);
    opts.imodelClient = imodelClient;

    // iTwinStack: Setup IModelBankBasicAuthorizationClient from username and password in config
    const email = Config.App.get("imjs_imodelbank_user");
    const password = Config.App.get("imjs_imodelbank_password");
    opts.authorizationClient = new IModelBankBasicAuthorizationClient({id: Guid.createValue()}, {email, password});

    await IModelApp.startup(opts);

    // iTwinStack: This sample application doesn't provide UI for logging in
    // It just automatically signs in with credentials provided in configuration
    await IModelApp.authorizationClient?.signIn(new ClientRequestContext());

    // contains various initialization promises which need
    // to be fulfilled before the app is ready
    const initPromises = new Array<Promise<any>>();

    // initialize RPC communication
    initPromises.push(ITwinStackApp.initializeRpc());

    // initialize UiComponents
    initPromises.push(UiComponents.initialize(IModelApp.i18n));

    // the app is ready when all initialization promises are fulfilled
    await Promise.all(initPromises);
  }

  private static async initializeRpc(): Promise<void> {
    const rpcInterfaces = getSupportedRpcs();
    const rpcParams = { info: { title: "itwin-stack-app", version: "v1.0" }, uriPrefix: "http://localhost:3001" };
    BentleyCloudRpcManager.initializeClient(rpcParams, rpcInterfaces);
  }
}
