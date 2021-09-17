/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "@itwinjs-sandbox";
import { SampleSpec } from "SampleSpec";

export function getDesignElementClassificationSpec(): SampleSpec {
  return ({
    name: "design-element-classification-sample",
    label: "DesignElementClassification",
    image: "transformations.png",
    readme: async () => import("!!raw-loader!./README.md"),
    files: () => [
      import("!editor-file-loader!./DesignElementClassificationClient"),
      import("!editor-file-loader!./DesignElementClassificationApi"),
      import("!editor-file-loader!./DesignElementClassificationApp?entry=true"),
      import("!editor-file-loader!./DesignElementClassificationLabelsWidget"),
      import("!editor-file-loader!./DesignElementClassificationTableWidget"),
      import("!editor-file-loader!./design-element-classification.scss"),
    ],
    iModelList: [SampleIModels.BayTown],
    type: "DesignElementClassificationApp.tsx",
    description: "How use the #Transformations #API to transform an iModel into another, and display them.",
  });
}
