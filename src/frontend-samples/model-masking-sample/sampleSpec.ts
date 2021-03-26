/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "common/IModelSelector/IModelSelector";
import { SampleSpec } from "SampleSpec";

export function getModelMaskingSpec(): SampleSpec {
  return ({
    name: "model-masking-sample",
    label: "Model Masking",
    image: "model-masking-thumbnail.png",
    customModelList: [SampleIModels.ExtonCampus, SampleIModels.CoffsHarborDemo],
    readme: async () => import("!!raw-loader!./README.md"),
    files: () => [
      { name: "ModelMaskingApp.tsx", import: import("!!raw-loader!./ModelMaskingApp"), entry: true },
      { name: "ModelMaskingUI.tsx", import: import("!!raw-loader!./ModelMaskingUI") },
    ],
    type: "ModelMaskingUI.tsx",
  });
}
