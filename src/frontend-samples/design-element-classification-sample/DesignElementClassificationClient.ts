/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { IncludePrefix, RequestOptions } from "@bentley/itwin-client";
import { IModelApp } from "@bentley/imodeljs-frontend";
import { AuthorizationClient } from "@itwinjs-sandbox";

export default class DesignElementClassificationClient {

  public static async getClassificationPredictionResults(runId: string): Promise<any | undefined> {
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

    // hack to handle redirect 
    var response = await fetch(url, { method: options.method, headers: options.headers });
    if (response.redirected && !response.ok)
      response = await fetch(response.url);

    return response.json();
  }

  private static async getAccessToken() {
    try {
      return await (IModelApp.authorizationClient as AuthorizationClient).getDevAccessToken();
    } catch (e) {
      return undefined;
    }
  }
}