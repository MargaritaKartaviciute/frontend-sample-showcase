/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { CompressedId64Set, Id64Set } from "@bentley/bentleyjs-core";
import { ContextRealityModelProps, ModelProps, PlanarClipMaskMode, PlanarClipMaskProps, PlanarClipMaskSettings } from "@bentley/imodeljs-common";
import { ContextRealityModelState, EmphasizeElements, findAvailableUnattachedRealityModels, GeometricModel3dState, IModelApp, IModelConnection, ScreenViewport, Viewport } from "@bentley/imodeljs-frontend";
import "common/samples-common.scss";

export default class ModelMaskingApp {
  /** */
  private static _models?: ModelProps[];
  /** */
  private static _realityModelProps?: ContextRealityModelProps[];

  /**  */
  public static setModelMasking(viewport: Viewport, style: PlanarClipMaskProps) {
    viewport.displayStyle.changeBackgroundMapProps({
      planarClipMask: style,
    });
  }

  /** */
  public static async queryForModels(iModel: IModelConnection): Promise<ModelProps[]> {
    const query = { from: GeometricModel3dState.classFullName, wantPrivate: true };
    return iModel.models.queryProps(query);
  }

  public static async getModelIds(iModel: IModelConnection): Promise<Id64Set> {
    const props = await ModelMaskingApp.queryForModels(iModel);
    const idArray: string[] = props
      .map((prop) => prop.id)
      .filter((id): id is string => typeof id === "undefined");
    return new Set<string>(idArray);
  }

  public static async getElementIds(iModel: IModelConnection): Promise<Id64Set> {
    const selectAllElementsIds = `SELECT ECInstanceId FROM BisCore.GeometricElement3d`;

    const ids = new Set<string>();
    for await (const row of iModel.query(selectAllElementsIds)) {
      ids.add(row);
    }
    return ids;
  }

  public static async getTargetMeshId(): Promise<string | number | undefined> {
    // write here about Contextual vs Attached reality models
    if (ModelMaskingApp._realityModelProps !== undefined && ModelMaskingApp._realityModelProps.length > 0) {
      return 0;
    }
    return undefined;
  }

  /** */
  public static async compressCategoryIds(iModel: IModelConnection, ...categoryCodes: string[]): Promise<CompressedId64Set> {
    const selectCategoryIds = `SELECT ECInstanceId FROM bis.Category WHERE CodeValue IN ('${categoryCodes.join("','")}')`;

    // TODO: is viewport really necessary?
    const ids = new Set<string>();
    for await (const row of iModel.query(selectCategoryIds)) {
      const sub = IModelApp.viewManager.selectedView?.getSubCategories(row.id);
      if (sub)
        sub.forEach((id) => ids.add(id));
      else
        ids.add(row.id);
    }

    return CompressedId64Set.compressSet(ids);
  }

  /** */
  public static async compressElementIds(iModel: IModelConnection, ...categoryCodes: string[]): Promise<CompressedId64Set> {
    const selectCategoryIds = `SELECT ECInstanceId FROM bis.Category WHERE CodeValue IN ('${categoryCodes.join("','")}')`;
    // const selectRelevantCategories = `SELECT ECInstanceId FROM BisCore.SpatialCategory WHERE CodeValue IN ('${categoryCodes.join("','")}')`;
    const selectElementsInCategories = `SELECT ECInstanceId FROM BisCore.GeometricElement3d WHERE Category.Id IN (${selectCategoryIds})`;

    // TODO: is viewport really necessary?
    const ids = new Set<string>();
    for await (const row of iModel.query(selectElementsInCategories)) {
      ids.add(row.id);
    }

    return CompressedId64Set.compressSet(ids);
  }

  /** */
  public static async compressModelIds(iModel: IModelConnection): Promise<CompressedId64Set> {
    // TODO: is viewport really necessary?
    const models = await ModelMaskingApp.queryForModels(iModel);
    const idArray: string[] = models
      .map((props) => props.id)
      .filter((id): id is string => typeof id === "undefined");
    const ids = new Set<string>(idArray);
    for (const model of await ModelMaskingApp.queryForModels(iModel)) {
      if (model.id)
        ids.add(model.id);
      console.debug(model.name);
    }

    return CompressedId64Set.compressSet(ids);
  }

  /** */
  public static async toggleBimModel(viewport: Viewport, showModel: boolean) {
    if (!ModelMaskingApp._models)
      ModelMaskingApp._models = await this.queryForModels(viewport.iModel);
    ModelMaskingApp._models
      .map((model) => model.id)
      .filter((id) => id !== undefined)
      .forEach((modelId) => {
        if (showModel)
          viewport.addViewedModels(modelId!);
        else
          viewport.changeModelDisplay(modelId!, showModel);
      });
  }

  /** */
  public static toggleBackgroundMap(viewport: Viewport, showMap: boolean) {
    viewport.displayStyle.changeBackgroundMapProps({ applyTerrain: true });
    const vf = viewport.viewFlags.clone();
    vf.backgroundMap = showMap;
    viewport.viewFlags = vf;
    console.debug("App", viewport.viewFlags.backgroundMap);
  }

  /**  */
  public static async toggleRealityModel(viewport: ScreenViewport, showReality: boolean) {
    if (showReality) {
      const imodel = viewport.iModel;
      // Get first available reality model and attach it to displayStyle
      if (ModelMaskingApp._realityModelProps === undefined)
        ModelMaskingApp._realityModelProps = await findAvailableUnattachedRealityModels(imodel.contextId!, imodel);
      ModelMaskingApp._realityModelProps.forEach((crmProp) => {
        viewport.attachRealityModel(crmProp);
        // const settings = PlanarClipMaskSettings.create(PlanarClipMaskMode.Models, new Set<string>())!;
        // viewport.displayStyle.overrideRealityModelPlanarClipMask(settings);
      });
    } else {
      viewport.detachRealityModelByIndex(-1);
      ModelMaskingApp._realityModelProps = undefined;
    }
  }
}

// export class MaskingManager {
//   private _modelIds: ModelProps[];
//   private _realityMesh: ContextRealityModelProps[];

//   public static async create(viewport: Viewport): MaskingManager {

//   }
// }
