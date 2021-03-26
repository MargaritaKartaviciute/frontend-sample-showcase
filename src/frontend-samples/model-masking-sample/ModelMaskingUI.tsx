/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { EmphasizeElements, IModelApp, IModelConnection, ScreenViewport, Viewport } from "@bentley/imodeljs-frontend";
import "common/samples-common.scss";
import { ControlPane } from "common/ControlPane/ControlPane";
import { SandboxViewport } from "common/SandboxViewport/SandboxViewport";
import * as React from "react";
import ModelMaskingApp from "./ModelMaskingApp";
import { Select, Toggle } from "@bentley/ui-core";
import { PlanarClipMaskMode, PlanarClipMaskProps } from "@bentley/imodeljs-common";
import { CompressedId64Set, SortedArray } from "@bentley/bentleyjs-core";

interface SampleState {
  backgroundMap: boolean;
  modelMasking: boolean;
  populatedProps: PlanarClipMaskProps;
}

interface ModelMaskingUIProps {
  iModelName: string;
  iModelSelector: React.ReactNode;
}

export default class ModelMaskingUI extends React.Component<ModelMaskingUIProps, SampleState> {

  public state: SampleState = {
    backgroundMap: true,
    modelMasking: true,
    populatedProps: { mode: PlanarClipMaskMode.None },
  };
  // 'S-SLAB-CONC'

  // Will be triggered once when the iModel is loaded.
  private readonly _onIModelReady = (iModel: IModelConnection) => {
    IModelApp.viewManager.onViewOpen.addOnce(async (viewport: ScreenViewport) => {
      ModelMaskingApp.toggleRealityModel(true, viewport, iModel);
      // this.setState({ viewport });
      const selectInCategories = `SELECT ECInstanceId FROMbis.Category WHERE CodeValue='S-SLAB-CONC'`;
      // const selectRelevantCategories = `SELECT ECInstanceId FROM BisCore.SpatialCategory WHERE CodeValue IN ('${categoryCodes.join("','")}')`;
      const selectElementsInCategories = `SELECT ECInstanceId FROM BisCore.GeometricElement3d WHERE Category.Id IN (${selectInCategories})`;

      const elementIds = new Set<string>();
      const half = new Set<string>();
      let i = 0;
      for await (const row of iModel.query(selectElementsInCategories)) {
        if (i = (i + 1) % 2) half.add(row.id);
        elementIds.add(row.id);
      }
      const ee = EmphasizeElements.getOrCreate(viewport);
      // const ids = [];
      // for await (const row of iModel.query(selectInCategories)) {
      //   ids.push(row.id);
      // }
      console.debug(elementIds.size, elementIds, half);
      ee.isolateElements(elementIds, viewport);
      this.setState({
        populatedProps: {
          mode: PlanarClipMaskMode.Priority,
          // mode: PlanarClipMaskMode.IncludeElements,
          // subCategoryOrElementIds: CompressedId64Set.compressSet(elementIds),
        },
      });
    });
  };

  /** A render method called when the state or props are changed. */
  public componentDidUpdate(_prevProp: ModelMaskingUIProps, prevState: SampleState) {
    const vp = IModelApp.viewManager.selectedView;
    if (!vp)
      return;
    if (this.state.backgroundMap !== prevState.backgroundMap) {
      const vf = vp.viewFlags.clone();
      vf.backgroundMap = this.state.backgroundMap;
      vp.viewFlags = vf;
    }

    if (this.state.modelMasking !== prevState.modelMasking || this.state.populatedProps !== prevState.populatedProps) {
      let props: PlanarClipMaskProps;
      if (this.state.modelMasking)
        props = this.state.populatedProps;
      else
        props = { mode: PlanarClipMaskMode.None };
      vp.changeBackgroundMapProps({ planarClipMask: props });
    }
  }

  private getControls(): React.ReactNode {
    return (
      <div className={"sample-options-2col"}>
        <label>Background Map</label>
        <Toggle isOn={this.state.backgroundMap} onChange={(isChecked) => { this.setState({ backgroundMap: isChecked }); }} />
        <label>Masking</label>
        <Toggle isOn={this.state.modelMasking} onChange={(isChecked) => { this.setState({ modelMasking: isChecked }); }} />
      </div>
    );
  }

  /** The sample's render method */
  public render() {
    const instruction = "Use the drop down below to change the display style. Edit the \"Custom\" style in \"Style.ts\" and re-run the sample to see the changes.";
    return (
      <>
        { /* Display the instructions and iModelSelector for the sample on a control pane */}
        <ControlPane instructions={instruction} iModelSelector={this.props.iModelSelector} controls={this.getControls()}></ControlPane>
        { /* Viewport to display the iModel */}
        <SandboxViewport onIModelReady={this._onIModelReady} iModelName={this.props.iModelName} />
      </>
    );
  }
}
