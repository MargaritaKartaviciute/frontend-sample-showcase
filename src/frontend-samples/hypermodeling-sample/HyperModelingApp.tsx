/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { FunctionComponent, useCallback, useEffect, useState } from "react";
import { AuthorizationClient, default2DSandboxUi, SampleIModels, useSampleWidget, ViewSetup } from "@itwinjs-sandbox";
import { Viewer } from "@itwin/web-viewer-react";
import { IModelApp, IModelConnection } from "@bentley/imodeljs-frontend";
import { IModelViewportControlOptions } from "@bentley/ui-framework";
import { HyperModelingWidgetProvider } from "./HyperModelingWidget";
import HyperModelingApi from "./HyperModelingApi";

const uiProviders = [new HyperModelingWidgetProvider()];

const HyperModelingApp: FunctionComponent = () => {
  const sampleIModelInfo = useSampleWidget("Using the Hyper-Modeling controls, enable or disable 2D graphics. Use the buttons to view a 2D sheet or drawing, or select a new marker to view a new section.", [SampleIModels.House]);
  const [viewportOptions, setViewportOptions] = useState<IModelViewportControlOptions>({ alwaysUseSuppliedViewState: true });

  useEffect(() => {
    const removeListener = HyperModelingApi.onReady.addListener(async () => {
      if (IModelApp.viewManager.selectedView) {
        await HyperModelingApi.activateMarkerByName(IModelApp.viewManager.selectedView, "Section-Left");
      }
    });
    return removeListener;
  });

  const _onIModelReady = useCallback(async (iModelConnection: IModelConnection) => {
    const viewState = await ViewSetup.getDefaultView(iModelConnection);
    setViewportOptions((prev) => ({ ...prev, viewState }));
  }, []);

  return (
    <>
      { /* Viewport to display the iModel */}
      {sampleIModelInfo?.contextId && sampleIModelInfo?.iModelId &&
        <Viewer
          contextId={sampleIModelInfo.contextId}
          iModelId={sampleIModelInfo.iModelId}
          authConfig={{ oidcClient: AuthorizationClient.oidcClient }}
          viewportOptions={viewportOptions}
          defaultUiConfig={default2DSandboxUi}
          onIModelConnected={_onIModelReady}
          uiProviders={uiProviders}
          theme="dark"
        />
      }
    </>
  );
};

export default HyperModelingApp;
