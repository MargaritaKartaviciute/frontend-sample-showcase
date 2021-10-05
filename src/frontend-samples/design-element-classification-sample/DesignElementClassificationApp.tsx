/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { FunctionComponent, useState } from "react";
import { AuthorizationClient, default2DSandboxUi, default3DSandboxUi, SampleIModels, useSampleWidget, ViewSetup } from "@itwinjs-sandbox";
import { Viewer } from "@itwin/web-viewer-react";
import { IModelConnection, StandardViewId } from "@bentley/imodeljs-frontend";
import { IModelViewportControlOptions } from "@bentley/ui-framework";
import { DesignElementClassificationTableWidgetProvider } from "./DesignElementClassificationTableWidget";
import { DesignElementClassificationLabelsProvider } from "./DesignElementClassificationLabelsWidget";
import "./design-element-classification.scss";

const uiProviders = [new DesignElementClassificationLabelsProvider(), new DesignElementClassificationTableWidgetProvider()];

const ViewportOnlyApp: FunctionComponent = () => {
  const sampleIModelInfo = useSampleWidget("Use the toggle at the top-right to enable/disable misclassified elements highlighting in iModel. Click on table or label to review misclassified elements.", [SampleIModels.BayTown]);
  const [viewportOptions, setViewportOptions] = useState<IModelViewportControlOptions>();

  const _oniModelReady = async (iModelConnection: IModelConnection) => {
    const viewState = await ViewSetup.getDefaultView(iModelConnection);
    viewState.setStandardRotation(StandardViewId.Iso);

    const range = viewState.computeFitRange();
    const aspect = viewState.getAspectRatio();

    viewState.lookAtVolume(range, aspect);
    setViewportOptions({ viewState });
  };

  return (
    <>
      { /* Viewport to display the iModel */}
      {sampleIModelInfo?.contextId && sampleIModelInfo?.iModelId &&
        <Viewer
          contextId={sampleIModelInfo.contextId}
          iModelId={sampleIModelInfo.iModelId}
          authConfig={{ oidcClient: AuthorizationClient.oidcClient }}
          viewportOptions={viewportOptions}
          defaultUiConfig={default3DSandboxUi}
          theme="dark"
          onIModelConnected={_oniModelReady}
          uiProviders={uiProviders}
        />
      }
    </>
  );
};

export default ViewportOnlyApp;