/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AuthorizationClient, default3DSandboxUi, SampleIModels, ViewSetup } from "@itwinjs-sandbox";
import React, { FunctionComponent, useCallback, useState } from "react";
import { Viewer } from "@itwin/web-viewer-react";
import { ScreenViewport } from "@bentley/imodeljs-frontend";
import { IModelViewportControlOptions } from "@bentley/ui-framework";
import { useSampleWidget } from "@itwinjs-sandbox/hooks/useSampleWidget";
import { ScreenSpaceEffectsWidgetProvider } from "./ScreenSpaceEffectsWidget";

const uiProviders = [new ScreenSpaceEffectsWidgetProvider()];

const ScreenSpaceEffectsApp: FunctionComponent = () => {
  const sampleIModelInfo = useSampleWidget("Use the toggles below to select which effects are applied to the viewport.", [SampleIModels.Villa, SampleIModels.RetailBuilding, SampleIModels.MetroStation, SampleIModels.House]);
  const [viewportOptions, setViewportOptions] = useState<IModelViewportControlOptions>();

  const viewportConfigurer = useCallback(async (viewport: ScreenViewport) => {
    viewport.viewFlags.grid = false;

    const viewState = await ViewSetup.getDefaultView(viewport.iModel);
    setViewportOptions({ viewState });
  }, []);

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

export default ScreenSpaceEffectsApp;
