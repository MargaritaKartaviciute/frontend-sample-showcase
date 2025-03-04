/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { Id64String } from "@bentley/bentleyjs-core";
import { /* BrowserAuthorizationCallbackHandler */ BrowserAuthorizationClient /* BrowserAuthorizationClientConfiguration */ } from "@bentley/frontend-authorization-client";
import { UrlDiscoveryClient } from "@bentley/itwin-client";
import { FrontendRequestContext, IModelApp, IModelAppOptions, IModelConnection } from "@bentley/imodeljs-frontend";
import { BentleyCloudRpcManager, IModelReadRpcInterface, IModelTileRpcInterface } from "@bentley/imodeljs-common";
import { MarkupApp } from "@bentley/imodeljs-markup";
import { PresentationRpcInterface, Ruleset } from "@bentley/presentation-common";
import { Presentation } from "@bentley/presentation-frontend";
import { ShowcaseNotificationManager } from "./api/Notifications/NotificationManager";
import { FrameworkReducer, StateManager, UiFramework } from "@bentley/ui-framework";
import { AuthorizationClient } from "@itwinjs-sandbox/authentication/AuthorizationClient";
import * as HILITE_RULESET from "@bentley/presentation-frontend/lib/presentation-frontend/selection/HiliteRules.json";
import { MovePointTool } from "Components/SampleVisualizer/InteractivePointMarker";
import { ShowcaseToolAdmin } from "@itwinjs-sandbox/api/ShowcaseToolAdmin";

// Boiler plate code
export interface SampleContext {
  imodel: IModelConnection;
  viewDefinitionId: Id64String;
}

const i18nNamespace = "sample-showcase-i18n-namespace";
export class SampleBaseApp {
  private static _appStateManager: StateManager | undefined;
  private static _reject: (() => void) | undefined;

  public static get oidcClient() { return IModelApp.authorizationClient as BrowserAuthorizationClient; }
  public static async startup(options?: IModelAppOptions) {

    return new Promise<void>(async (resolve, reject) => {
      SampleBaseApp._reject = () => {
        reject("Cancelled");
      };

      try {
        const opts: IModelAppOptions = Object.assign({
          tileAdmin: { useProjectExtents: false },
          notifications: new ShowcaseNotificationManager(),
          toolAdmin: ShowcaseToolAdmin.initialize(),
        }, options);

        await IModelApp.startup(opts);

        IModelApp.authorizationClient = AuthorizationClient.oidcClient;

        // use new state manager that allows dynamic additions from extensions and snippets
        if (!SampleBaseApp._appStateManager) {
          SampleBaseApp._appStateManager = new StateManager({
            frameworkState: FrameworkReducer,
          });
        }

        // contains various initialization promises which need
        // to be fulfilled before the app is ready
        const initPromises = new Array<Promise<any>>();

        // initialize RPC communication
        initPromises.push(SampleBaseApp.initializeRpc());

        // initialize UiFramework
        initPromises.push(UiFramework.initialize(undefined));

        // initialize Presentation
        initPromises.push(Presentation.initialize({
          activeLocale: IModelApp.i18n.languageList()[0],
        }));

        // initialize Markup
        initPromises.push(MarkupApp.initialize());

        // the app is ready when all initialization promises are fulfilled
        await Promise.all(initPromises);

        const namespace = IModelApp.i18n.registerNamespace(i18nNamespace);
        MovePointTool.register(namespace);

        await Presentation.presentation.rulesets().add((HILITE_RULESET as any).default as Ruleset);
        resolve();
      } catch (err) {
        reject(err);
      } finally {
        SampleBaseApp._reject = undefined;
      }
    });

  }

  public static cancel: () => void = () => {
    if (SampleBaseApp._reject) {
      SampleBaseApp._reject();
    }
  };

  private static async initializeRpc(): Promise<void> {
    const rpcInterfaces = [IModelReadRpcInterface, IModelTileRpcInterface, PresentationRpcInterface];

    // initialize RPC for web apps
    const urlClient = new UrlDiscoveryClient();
    const requestContext = new FrontendRequestContext();
    const orchestratorUrl = await urlClient.discoverUrl(requestContext, "iModelJsOrchestrator.K8S", undefined);
    const rpcParams = { info: { title: "general-purpose-imodeljs-backend", version: "v2.0" }, uriPrefix: orchestratorUrl };

    BentleyCloudRpcManager.initializeClient(rpcParams, rpcInterfaces);
  }
}
