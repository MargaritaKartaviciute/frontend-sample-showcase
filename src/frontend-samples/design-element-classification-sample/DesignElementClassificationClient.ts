/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { IncludePrefix, request, RequestOptions } from "@bentley/itwin-client";
import { AuthorizedFrontendRequestContext, IModelApp } from "@bentley/imodeljs-frontend";
import { AuthorizationClient } from "@itwinjs-sandbox";

export default class DesignElementClassificationClient {

  public static async getClassificationPredictionResults(runId: string, requestContext: AuthorizedFrontendRequestContext): Promise<any | undefined> {
    const accessToken = await DesignElementClassificationClient.getAccessToken();

    if (accessToken === undefined)
      return undefined;

    const url = `https://api.bentley.com/designelementclassification/runs/${runId}/results/misclassifications.json`;
    const options: RequestOptions = {
      method: "GET",
      headers: {
        Accept: "application/vnd.bentley.itwin-platform.v1+json",
        Authorization: accessToken.toTokenString(IncludePrefix.Yes),
      },
    };

    return request(requestContext, url, options)
      .then((resp) => {
        if (resp.text === undefined) return undefined;
        return JSON.parse(resp.text as string);
      }).catch((_reason: any) => {
        return undefined;
      });
  }

  private static async getAccessToken() {
    try {
      return await (IModelApp.authorizationClient as AuthorizationClient).getDevAccessToken();
    } catch (e) {
      return undefined;
    }
  }
}