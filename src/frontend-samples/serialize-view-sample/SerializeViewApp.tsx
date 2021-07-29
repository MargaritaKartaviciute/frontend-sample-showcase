/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AuthorizationClient, default3DSandboxUi, SampleIModels, useSampleWidget, ViewSetup } from "@itwinjs-sandbox";
import React, { FunctionComponent, useCallback, useState } from "react";
import { Viewer } from "@itwin/web-viewer-react";
import { ScreenViewport } from "@bentley/imodeljs-frontend";
import { IModelViewportControlOptions } from "@bentley/ui-framework";
import { SerializeViewWidgetProvider } from "./SerializeViewWidget";
import { IModelViews, sampleViewStates } from "./SampleViewStates";
import SerializeViewApi from "./SerializeViewApi";

const uiProviders = [new SerializeViewWidgetProvider()];

const SerializeViewApp: FunctionComponent = () => {
  const allSavedViews: IModelViews[] = [...sampleViewStates];
  const sampleIModelInfo = useSampleWidget("Use the controls below to change the view attributes.", [SampleIModels.MetroStation, SampleIModels.RetailBuilding]);
  const [viewportOptions, setViewportOptions] = useState<IModelViewportControlOptions>();

  const viewportConfigurer = useCallback(async (viewport: ScreenViewport) => {
    /** Grab the IModel with views that match the imodel loaded. */
    const iModelWithViews = allSavedViews.filter((iModelViews) => {
      return iModelViews.iModelId === viewport.iModel.iModelId;
    });

    /** Grab the views of the iModel just loaded and load the first view state in the SampleViewStates.ts */
    if (iModelWithViews.length > 0) {
      const views = iModelWithViews[0].views;
      const viewState = await SerializeViewApi.deserializeViewState(viewport.iModel, views[0].view);
      setViewportOptions({ viewState });
    } else {
      const viewState = await ViewSetup.getDefaultView(viewport.iModel);
      setViewportOptions({ viewState });
    }
  }, [allSavedViews]);

  /** The sample's render method */
  return (
    <>
      { /** Viewport to display the iModel */}
      {sampleIModelInfo?.iModelName && sampleIModelInfo?.contextId && sampleIModelInfo?.iModelId &&
        <Viewer
          contextId={sampleIModelInfo.contextId}
          iModelId={sampleIModelInfo.iModelId}
          authConfig={{ oidcClient: AuthorizationClient.oidcClient }}
          viewportOptions={viewportOptions}
          viewCreatorOptions={{ viewportConfigurer }}
          defaultUiConfig={default3DSandboxUi}
          theme="dark"
          uiProviders={uiProviders}
        />
      }
    </>
  );

};

export default SerializeViewApp;
