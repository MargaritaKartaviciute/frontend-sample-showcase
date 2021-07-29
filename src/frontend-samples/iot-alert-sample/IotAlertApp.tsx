/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AuthorizationClient, default3DSandboxUi, SampleIModels, useSampleWidget, ViewSetup } from "@itwinjs-sandbox";
import React, { FunctionComponent, useCallback, useState } from "react";
import { Viewer } from "@itwin/web-viewer-react";
import { ScreenViewport } from "@bentley/imodeljs-frontend";
import { IModelViewportControlOptions, MessageRenderer } from "@bentley/ui-framework";
import { IotAlertWidgetProvider } from "./IotAlertWidget";

const uiProviders = [new IotAlertWidgetProvider()];

const IotAlertApp: FunctionComponent = () => {
  const sampleIModelInfo = useSampleWidget("Use the controls below to change the iModel.", [SampleIModels.BayTown]);
  const [viewportOptions, setViewportOptions] = useState<IModelViewportControlOptions>();

  const viewportConfigurer = useCallback(async (viewport: ScreenViewport) => {
    const viewState = await ViewSetup.getDefaultView(viewport.iModel);
    setViewportOptions({ viewState });
  }, []);

  /** The sample's render method */
  return (
    <>
      <MessageRenderer />
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

export default IotAlertApp;
