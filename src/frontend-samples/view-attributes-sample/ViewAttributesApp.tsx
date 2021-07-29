/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AuthorizationClient, default3DSandboxUi, SampleIModels, useSampleWidget, ViewSetup } from "@itwinjs-sandbox";
import React, { FunctionComponent, useCallback, useState } from "react";
import { Viewer } from "@itwin/web-viewer-react";
import { ViewAttributesWidgetProvider } from "./ViewAttributesWidget";
import { ScreenViewport } from "@bentley/imodeljs-frontend";
import { ViewAttributesApi } from "./ViewAttributesApi";
import { IModelViewportControlOptions } from "@bentley/ui-framework";

const uiProviders = [new ViewAttributesWidgetProvider()];

const ViewAttributesApp: FunctionComponent = () => {
  const sampleIModelInfo = useSampleWidget("Use the controls below to change the view attributes.", [SampleIModels.House, SampleIModels.MetroStation]);
  const [viewportOptions, setViewportOptions] = useState<IModelViewportControlOptions>();

  const viewportConfigurer = useCallback(async (viewport: ScreenViewport) => {
    ViewAttributesApi.setAttrValues(viewport, ViewAttributesApi.settings);

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

export default ViewAttributesApp;
