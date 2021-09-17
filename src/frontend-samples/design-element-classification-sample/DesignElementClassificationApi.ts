/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { ColorDef, FeatureOverrideType } from "@bentley/imodeljs-common";
import { EmphasizeElements, IModelApp, MarginPercent, ScreenViewport, ViewChangeOptions } from "@bentley/imodeljs-frontend";
import { labelColors } from "./DesignElementClassificationLabelsColors";

export default class DesignElementClassificationApi {

  public static readonly Run_Id = "67511bbe-8e0c-4786-b0f4-01078b9cb860";

  private static _applyEmphasize: Boolean = true;

  public static async visualizeElements(elements: { [key: string]: string }) {
    if (!DesignElementClassificationApi._applyEmphasize)
      return;

    if (!IModelApp.viewManager.selectedView)
      return;

    const vp = IModelApp.viewManager.selectedView;
    const emph = EmphasizeElements.getOrCreate(vp);

    DesignElementClassificationApi.clearEmphasizeElements(vp, emph)

    const elementsIds = Object.keys(elements);
    for (const elementKey in elementsIds) {
      emph.overrideElements(elementKey, vp, DesignElementClassificationApi.getLabelColor(elements[elementKey]), FeatureOverrideType.ColorOnly, true);
    }
    DesignElementClassificationApi.emphasizeElements(vp, emph, elementsIds)
    DesignElementClassificationApi.zoomElements(vp, elementsIds);
  }

  public static async visualizeElementsByLabel(elementsIds: string[], label: string) {
    if (!DesignElementClassificationApi._applyEmphasize)
      return;

    if (!IModelApp.viewManager.selectedView)
      return;

    const vp = IModelApp.viewManager.selectedView;
    const emph = EmphasizeElements.getOrCreate(vp);

    DesignElementClassificationApi.clearEmphasizeElements(vp, emph)

    for (const elementId of elementsIds)
      emph.overrideElements(elementId, vp, DesignElementClassificationApi.getLabelColor(label), FeatureOverrideType.ColorOnly, true);

    DesignElementClassificationApi.emphasizeElements(vp, emph, elementsIds)
    DesignElementClassificationApi.zoomElements(vp, elementsIds);
  }

  public static getLabelColor(label: string) {
    return labelColors.get(label) ?? ColorDef.black
  }

  public static emphasizeMisclassifiedElements(misclassifiedElements: string[]) {
    if (!IModelApp.viewManager.selectedView)
      return;

    const vp = IModelApp.viewManager.selectedView;
    const emph = EmphasizeElements.getOrCreate(vp);

    DesignElementClassificationApi.clearEmphasizeElements(vp, emph)
    DesignElementClassificationApi.emphasizeElements(vp, emph, misclassifiedElements)
  }

  public static clearMisclassifiedEmphasizeElements() {
    if (!IModelApp.viewManager.selectedView)
      return;

    const vp = IModelApp.viewManager.selectedView;
    const emph = EmphasizeElements.getOrCreate(vp);

    DesignElementClassificationApi.clearEmphasizeElements(vp, emph)
  }

  public static setEmphasisMode(enabled: Boolean = true) {
    DesignElementClassificationApi._applyEmphasize = enabled;
  }

  private static clearEmphasizeElements(vp: ScreenViewport, emph: EmphasizeElements) {
    emph.clearEmphasizedElements(vp);
    emph.clearOverriddenElements(vp);
  }

  private static emphasizeElements(vp: ScreenViewport, emph: EmphasizeElements, elementsIds: string[]) {
    emph.wantEmphasis = true;
    emph.emphasizeElements(elementsIds, vp, undefined, false);
  }

  private static zoomElements(vp: ScreenViewport, elementsIds: string[]) {
    const viewChangeOpts: ViewChangeOptions = {};
    viewChangeOpts.animateFrustumChange = true;
    viewChangeOpts.marginPercent = new MarginPercent(0.25, 0.25, 0.25, 0.25);
    vp.zoomToElements(elementsIds, { ...viewChangeOpts })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error);
      });
  }
}