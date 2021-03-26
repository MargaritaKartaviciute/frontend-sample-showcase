/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { ContextRealityModelProps, PlanarClipMaskProps } from "@bentley/imodeljs-common";
import { ContextRealityModelState, findAvailableUnattachedRealityModels, IModelConnection, ScreenViewport, Viewport } from "@bentley/imodeljs-frontend";
import "common/samples-common.scss";

export default class ModelMaskingApp {
  /**  */
  public static setModelMasking(viewport: Viewport, style: PlanarClipMaskProps) {
    viewport.displayStyle.changeBackgroundMapProps({
      planarClipMask: style,
    });
  }

  public static async toggleRealityModel(showReality: boolean, viewport: ScreenViewport, imodel: IModelConnection) {
    const style = viewport.displayStyle.clone();

    if (showReality) {
      // Get first available reality model and attach it to displayStyle
      const availableModels: ContextRealityModelProps[] = await findAvailableUnattachedRealityModels(imodel.contextId!, imodel);
      for (const crmProp of availableModels) {
        style.attachRealityModel(crmProp);
        viewport.displayStyle = style;
        return;
      }
    } else {
      // Collect reality models on displayStyle and detach
      const models: ContextRealityModelState[] = [];
      style.forEachRealityModel(
        (modelState: ContextRealityModelState) => { models.push(modelState); },
      );
      for (const model of models)
        style.detachRealityModelByNameAndUrl(model.name, model.url);
      viewport.displayStyle = style;
    }
  }
}
