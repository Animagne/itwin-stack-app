/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";

import { Config, Logger, LogLevel } from "@bentley/bentleyjs-core";
import { IModelJsExpressServer } from "@bentley/express-server";
import { IModelHost, IModelHostConfiguration } from "@bentley/imodeljs-backend";
import { AzureFileHandler, StorageServiceFileHandler } from "@bentley/backend-itwin-client";
import { BentleyCloudRpcManager, RpcConfiguration } from "@bentley/imodeljs-common";

import { getSupportedRpcs } from "../common/rpcs";
import { parseBasicAccessToken } from "./BasicAuthorization";
import { IModelBankClient } from "@bentley/imodelhub-client";
import { LocalhostHandler } from "./LocalhostHandler";


// Setup logging immediately to pick up any logging during IModelHost.startup()
Logger.initializeToConsole();
Logger.setLevelDefault(LogLevel.Warning);
Logger.setLevel("itwin-stack-app", LogLevel.Info);

function getFileHandlerFromConfig() {
  const storageType: string = Config.App.get("imjs_imodelbank_storage_type");
  switch (storageType) {
    case "azure":
      return new AzureFileHandler();
    case "servicestorage":
      return new StorageServiceFileHandler();
    case "localhost":
    default:
      return new LocalhostHandler();
  }
}

(async () => {
  try {
    // Configure environment variables from the .env.local file
    dotenvConfig({path: resolve(__dirname, "../../.env.local")});

    // Initialize iModelHost
    const config = new IModelHostConfiguration();

    // iTwinStack: specify what kind of file handler is used by IModelBankClient
    const fileHandler = getFileHandlerFromConfig();

    // iTwinStack: setup IModelBankClient as imodelClient for IModelHost
    const url = Config.App.get("imjs_imodelbank_url");
    config.imodelClient = new IModelBankClient(url, fileHandler);
    await IModelHost.startup(config);

    // iTwinStack: need to specify how tokens are parsed by backend
    // These tokens will only be forwarded to iModelBank
    RpcConfiguration.requestContext.deserialize = parseBasicAccessToken;

    // Get RPCs supported by this backend
    const rpcs = getSupportedRpcs();

    // Setup the RPC interfaces and the backend metadata with the BentleyCloudRpcManager
    const rpcConfig = BentleyCloudRpcManager.initializeImpl({ info: { title: "itwin-stack-app", version: "v1.0" } }, rpcs);

    // Initialize Web Server backend
    const port = Number(process.env.PORT || 3001);
    const server = new IModelJsExpressServer(rpcConfig.protocol);
    await server.initialize(port);
    Logger.logInfo("itwin-stack-app", `RPC backend for itwin-stack-app listening on port ${port}`);
  } catch (error) {
    Logger.logError("itwin-stack-app", error);
    process.exitCode = 1;
  }
})(); // tslint:disable-line:no-floating-promises
