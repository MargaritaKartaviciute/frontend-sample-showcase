/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { ColorDef, FeatureOverrideType } from "@bentley/imodeljs-common";
import { AuthorizedFrontendRequestContext, EmphasizeElements, IModelApp, MarginPercent, ScreenViewport, ViewChangeOptions } from "@bentley/imodeljs-frontend";
import DesignElementClassificationClient from "./DesignElementClassificationClient";
import { labelColors } from "./DesignElementClassificationLabelsColors";

export default class DesignElementClassificationApi {

  public static readonly Run_Id = "05a2dbf0-229e-4faa-b9f6-78c5f220009b";

  private static _applyEmphasize: Boolean = true;
  private static _misclassificationsData: {};
  private static _requestContext: AuthorizedFrontendRequestContext;

  public static async visualizeElements(elements: { [key: string]: string }) {
    if (!DesignElementClassificationApi._applyEmphasize)
      return;

    if (!IModelApp.viewManager.selectedView)
      return;

    const vp = IModelApp.viewManager.selectedView;
    const emph = EmphasizeElements.getOrCreate(vp);

    DesignElementClassificationApi.clearEmphasizeElements(vp, emph);

    const elementsIds = Object.keys(elements);
    for (const elementKey in elementsIds) {
      emph.overrideElements(elementsIds[elementKey], vp, DesignElementClassificationApi.getLabelColor(elements[elementsIds[elementKey]]), FeatureOverrideType.ColorOnly, false);
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
      emph.overrideElements(elementId, vp, DesignElementClassificationApi.getLabelColor(label), FeatureOverrideType.ColorOnly, false);

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

  public static getMisclassificationData = async (): Promise<any> => {
    if (DesignElementClassificationApi._misclassificationsData)
      return DesignElementClassificationApi._misclassificationsData;

    let requestContext = await DesignElementClassificationApi.getRequestContext();

    DesignElementClassificationApi._misclassificationsData = DesignElementClassificationClient.getClassificationPredictionResults(DesignElementClassificationApi.Run_Id, requestContext);
    return DesignElementClassificationApi._misclassificationsData;
  }

  private static async getRequestContext() {
    if (!DesignElementClassificationApi._requestContext) {
      DesignElementClassificationApi._requestContext = await AuthorizedFrontendRequestContext.create();
    }
    return DesignElementClassificationApi._requestContext;
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