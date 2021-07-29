/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { FunctionComponent, useCallback, useState } from "react";
import { AuthorizationClient, default2DSandboxUi, SampleIModels, useSampleWidget, ViewSetup } from "@itwinjs-sandbox";
import { Viewer } from "@itwin/web-viewer-react";
import { ScreenViewport } from "@bentley/imodeljs-frontend";
import { IModelViewportControlOptions } from "@bentley/ui-framework";
import { ReadSettingsWidgetProvider } from "./ReadSettingsWidget";

const uiProviders = [new ReadSettingsWidgetProvider()];

const ReadSettingsApp: FunctionComponent = () => {
  const sampleIModelInfo = useSampleWidget("Choose a Setting Name below to read that setting from the ProductSettingsService", [SampleIModels.BayTown]);
  const [viewportOptions, setViewportOptions] = useState<IModelViewportControlOptions>();

  const viewportConfigurer = useCallback(async (viewport: ScreenViewport) => {
    const viewState = await ViewSetup.getDefaultView(viewport.iModel);
    setViewportOptions({ viewState });
  }, []);

  return (
    <>
      { /* Viewport to display the iModel */}
      {sampleIModelInfo?.contextId && sampleIModelInfo?.iModelId &&
        <Viewer
          productId="2686"
          contextId={sampleIModelInfo.contextId}
          iModelId={sampleIModelInfo.iModelId}
          authConfig={{ oidcClient: AuthorizationClient.oidcClient }}
          viewportOptions={viewportOptions}
          defaultUiConfig={default2DSandboxUi}
          viewCreatorOptions={{ viewportConfigurer }}
          uiProviders={uiProviders}
          theme="dark"
        />
      }
    </>
  );
};

export default ReadSettingsApp;

