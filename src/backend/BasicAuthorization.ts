/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AuthStatus, BentleyError, ClientRequestContext, Logger } from "@bentley/bentleyjs-core";
import { SerializedRpcRequest } from "@bentley/imodeljs-common";
import { BasicAccessToken } from "@bentley/imodelhub-client/lib/imodelbank/IModelBankBasicAuthorizationClient";
import { AccessToken, AuthorizedClientRequestContext, UserInfo } from "@bentley/itwin-client";

/**
 * A method that parses BasicAccessToken from a SerializedRpcRequest.
 * @param serializedContext Serialized RPC request, from which Authorization header should be parsed.
 */
export async function parseBasicAccessToken(serializedContext: SerializedRpcRequest): Promise<ClientRequestContext> {
  // Setup a ClientRequestContext if authorization is NOT required for the RPC operation
  if (!serializedContext.authorization)
    return new ClientRequestContext(serializedContext.id, serializedContext.applicationId, serializedContext.applicationVersion, serializedContext.sessionId);

  // Setup an AuthorizationClientRequestContext if authorization is required for the RPC operation
  let accessToken: AccessToken;
  // Determine the access token from the frontend request
  const prefix = "Basic ";
  const tokenStr = serializedContext.authorization;
  if (!tokenStr.startsWith(prefix)) {
    throw new BentleyError(AuthStatus.Error, "Invalid token prefix", Logger.logError, "itwin-stack-app", () => ({ tokenStr }));
  }
  const decodedToken = Buffer.from(tokenStr.substr(prefix.length), "base64").toString("utf8");
  const tokenParts = decodedToken.split(":");
  if (tokenParts.length !== 2) {
    throw new BentleyError(AuthStatus.Error, "Invalid basic token", Logger.logError, "itwin-stack-app", () => ({ tokenStr, decodedToken }));
  }
  accessToken = BasicAccessToken.fromCredentials({user: tokenParts[0], password: tokenParts[1]});

  const userId = serializedContext.userId;
  if (userId)
    accessToken.setUserInfo(new UserInfo(userId));

  return new AuthorizedClientRequestContext(accessToken, serializedContext.id, serializedContext.applicationId, serializedContext.applicationVersion, serializedContext.sessionId);
}
