/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useCallback } from "react";
import { ShowcaseToolAdmin } from "./TooltipCustomizeApi";
import { Viewer } from "@itwin/web-viewer-react";
import { AuthorizationClient, default3DSandboxUi, ViewSetup } from "@itwinjs-sandbox";
import { IModelViewportControlOptions } from "@bentley/ui-framework";
import { ScreenViewport } from "@bentley/imodeljs-frontend";
import { useSampleWidget } from "@itwinjs-sandbox/hooks/useSampleWidget";
import { TooltipCustomizeWidgetProvider } from "./TooltipCustomizeWidget";

const uiProviders = [new TooltipCustomizeWidgetProvider()];

const TooltipCustomizeApp: React.FunctionComponent = () => {
  const sampleIModelInfo = useSampleWidget("Hover the mouse pointer over an element to see the tooltip.  Use these options to control it.");
  const [viewportOptions, setViewportOptions] = React.useState<IModelViewportControlOptions>();

  const viewportConfigurer = useCallback(async (viewport: ScreenViewport) => {
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

          /** Pass the toolAdmin override directly into the viewer */
          toolAdmin={ShowcaseToolAdmin.initialize()}

          viewCreatorOptions={{ viewportConfigurer }}
          defaultUiConfig={default3DSandboxUi}
          theme="dark"
          uiProviders={uiProviders}
        />
      }
    </>
  );
};

export default TooltipCustomizeApp;
