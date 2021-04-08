/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { PlanarClipMaskMode, PlanarClipMaskPriority, PlanarClipMaskProps, PlanarClipMaskSettings } from "@bentley/imodeljs-common";
import { DisplayStyleState, EmphasizeElements, IModelApp, IModelConnection, PlanarClipMaskState, ScreenViewport, Viewport } from "@bentley/imodeljs-frontend";
import { Select, Toggle } from "@bentley/ui-core";
import { ControlPane } from "common/ControlPane/ControlPane";
import "common/samples-common.scss";
import { SandboxViewport } from "common/SandboxViewport/SandboxViewport";
import * as React from "react";
import ModelMaskingApp from "./ModelMaskingApp";

interface SampleState {
  backgroundMap: boolean;
  realityMesh: boolean;
  bimModel: boolean;
  isolate: boolean | undefined;
  storedPropsName: string;
}

interface ModelMaskingUIProps {
  iModelName: string;
  iModelSelector: React.ReactNode;
}

type MaskMethod = ((viewport: Viewport, transparency?: number) => Promise<void>);

function diff(obj1: any, obj2: any): any {
  const result: any = {};
  if (Object.is(obj1, obj2)) {
    return undefined;
  }
  if (!obj2 || typeof obj2 !== "object") {
    return obj2;
  }
  Object.keys(obj1 || {}).concat(Object.keys(obj2 || {})).forEach((key) => {
    if (obj2[key] !== obj1[key] && !Object.is(obj1[key], obj2[key])) {
      result[key] = obj2[key];
    }
    if (typeof obj2[key] === "object" && typeof obj1[key] === "object") {
      const value = diff(obj1[key], obj2[key]);
      if (value !== undefined) {
        result[key] = value;
      }
    }
  });
  return result;
}

export default class ModelMaskingUI extends React.Component<ModelMaskingUIProps, SampleState> {

  private readonly _predefinedProps = new Map<string, { conIsolate: boolean, applyMask: MaskMethod }>([
    [
      "Priority",
      {
        applyMask: async (vp: Viewport, transparency?: number) => {
          vp.changeBackgroundMapProps({
            planarClipMask: {
              mode: PlanarClipMaskMode.Priority,
              transparency,
            },
          });
        },
        conIsolate: false,
      },
    ],
    [
      "Mask Map by Elements",
      {
        applyMask: async (vp: Viewport, transparency?: number) => {
          let modelIds, elementIds;
          const settings = PlanarClipMaskSettings.create(
            PlanarClipMaskMode.IncludeElements,
            modelIds = await ModelMaskingApp.getModelIds(vp.iModel),
            elementIds = await ModelMaskingApp.getElementIds(vp.iModel),
            transparency,
          );
          vp.changeBackgroundMapProps({
            planarClipMask: settings,
          });
          if (settings === undefined)
            console.debug(`ModelIds:${modelIds}, ElementIds:${elementIds}`);
        },
        conIsolate: false,
      },
    ],
    [
      "Mask Mesh by Elements",
      {
        applyMask: async (vp: Viewport, transparency?: number) => {
          let modelIds, elementIds;
          const meshIdOrIndex = await ModelMaskingApp.getTargetMeshId();
          const settings = PlanarClipMaskSettings.create(
            PlanarClipMaskMode.IncludeElements,
            modelIds = await ModelMaskingApp.getModelIds(vp.iModel),
            elementIds = await ModelMaskingApp.getElementIds(vp.iModel),
            transparency,
          );
          if (settings === undefined || meshIdOrIndex === undefined)
            console.debug(`ModelIds:${modelIds}, ElementIds:${elementIds}, Mesh:${meshIdOrIndex}`);
          else
            vp.displayStyle.overrideRealityModelPlanarClipMask(
              meshIdOrIndex,
              settings,
            );
        },
        conIsolate: false,
      },
    ],
    [
      "Mask Mesh by Elements",
      {
        applyMask: async (vp: Viewport, transparency?: number) => {
          let modelIds, elementIds;
          const meshIdOrIndex = await ModelMaskingApp.getTargetMeshId();
          const settings = PlanarClipMaskSettings.create(
            PlanarClipMaskMode.IncludeElements,
            modelIds = await ModelMaskingApp.getModelIds(vp.iModel),
            elementIds = await ModelMaskingApp.getElementIds(vp.iModel),
            transparency,
          );
          if (settings === undefined || meshIdOrIndex === undefined)
            console.debug(`ModelIds:${modelIds}, ElementIds:${elementIds}, Mesh:${meshIdOrIndex}`);
          else
            vp.displayStyle.overrideRealityModelPlanarClipMask(
              meshIdOrIndex,
              settings,
            );
        },
        conIsolate: false,
      },
    ],
  ]);
  /*
    [
      "Categories",
      {
        applyMask: async (iModel: IModelConnection) => {
          return {
            mode: PlanarClipMaskMode.IncludeSubCategories,
            subCategoryOrElementIds: await ModelMaskingApp.compressCategoryIds(iModel, "Building Roof", "Building Walls", "Perimeter_Clip"),
          };
        },
        conIsolate: true,
      },
    ],
    [
      "Elements",
      {
        applyMask: async (iModel: IModelConnection) => {
          return {
            mode: PlanarClipMaskMode.IncludeElements,
            subCategoryOrElementIds: await ModelMaskingApp.compressElementIds(iModel, "Building Roof", "Building Walls", "Perimeter_Clip"),
          };
        },
        conIsolate: true,
      },
    ],
    [
      "Models (All)",
      {
        applyMask: async (iModel: IModelConnection) => {
          return {
            mode: PlanarClipMaskMode.Models,
            modelIds: await ModelMaskingApp.compressModelIds(iModel),
          };
        },
        conIsolate: true,
      },
    ],
    [
      "Models (None)",
      {
        applyMask: {
          mode: PlanarClipMaskMode.Models,
        },
        conIsolate: true,
      },
    ],
    [
      "None",
      {
        conIsolate: false,
        applyMask: {
          mode: PlanarClipMaskMode.None,
        },
      },
    ],
  */

  // private async getProps(iModel: IModelConnection, name: string): Promise<{ canIsolate: boolean, maskingProps: PlanarClipMaskProps } | undefined> {
  //   const props = this._predefinedProps.get(name);
  //   if (props === undefined)
  //     return undefined;
  //   let maskingProps: MaskMethod = props.applyMask;
  //   if (typeof maskingProps === "function") {
  //     maskingProps = await maskingProps(iModel);
  //     // cache results
  //     this._predefinedProps.set(name, { applyMask: maskingProps, conIsolate: props.conIsolate });
  //   }
  //   return { canIsolate: props.conIsolate, maskingProps };
  // }

  public state: SampleState = {
    backgroundMap: false,
    realityMesh: false,
    bimModel: false,
    isolate: undefined,
    storedPropsName: "",
  };

  // private debugMap(viewport: Viewport) {
  //   let prevProps: DisplayStyleState | undefined;
  //   const showMap = (): boolean => { return prevProps?.viewFlags.backgroundMap ?? false; };
  //   const log = (text: string, style: DisplayStyleState) => {
  //     let diffResults: any;
  //     // console.debug(text, style.viewFlags.backgroundMap, style.clone().toJSON());
  //     const flag = style.viewFlags.backgroundMap;
  //     if (flag !== showMap())
  //       diffResults = diff(prevProps?.toJSON() ?? {}, style.toJSON());
  //     console.debug(text, style.viewFlags.backgroundMap, diffResults);
  //     prevProps = style.clone();
  //   };
  //   viewport.onRender.addListener((vp) => log("render", vp.displayStyle));
  //   viewport.view.onDisplayStyleChanged.addListener((style) => log("style Changed", style));
  // }

  public async meterostationEdit(viewport: Viewport) {
    // 'S-SLAB-CONC'
    // this.setState({ viewport });
    const selectInCategories = `SELECT ECInstanceId FROM bis.Category WHERE CodeValue='S-SLAB-CONC'`;
    // const selectRelevantCategories = `SELECT ECInstanceId FROM BisCore.SpatialCategory WHERE CodeValue IN ('${categoryCodes.join("','")}')`;
    const selectElementsInCategories = `SELECT ECInstanceId FROM BisCore.GeometricElement3d WHERE Category.Id IN (${selectInCategories})`;

    const elementIds = new Set<string>();
    const half = new Set<string>();
    let i = 0;
    for await (const row of viewport.iModel.query(selectElementsInCategories)) {
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
  }

  // Will be triggered once when the iModel is loaded.
  private readonly _onIModelReady = (iModel: IModelConnection) => {
    // TODO: does this really need to be async?
    IModelApp.viewManager.onViewOpen.addOnce(async (viewport: ScreenViewport) => {
      // this.debugMap(viewport);
      if (iModel.name === "Meterostation2")
        await this.meterostationEdit(viewport);

      this.setState({
        bimModel: true,
        backgroundMap: true,
        realityMesh: true,
        storedPropsName: this._predefinedProps.keys().next().value,
      });
    });
  };

  /** A render method called when the state or props are changed. */
  public componentDidUpdate(_prevProp: ModelMaskingUIProps, prevState: SampleState) {
    const vp = IModelApp.viewManager.selectedView;
    if (!vp)
      return;
    if (this.state.backgroundMap !== prevState.backgroundMap) {
      ModelMaskingApp.toggleBackgroundMap(vp, this.state.backgroundMap);
    }
    if (this.state.realityMesh !== prevState.realityMesh) {
      ModelMaskingApp.toggleRealityModel(vp, this.state.realityMesh);
    }
    if (this.state.bimModel !== prevState.bimModel) {
      ModelMaskingApp.toggleBimModel(vp, this.state.bimModel);
    }

    if (this.state.storedPropsName !== prevState.storedPropsName) {
      const effectProps = this._predefinedProps.get(this.state.storedPropsName);
      if (effectProps === undefined)
        // TODO: Probably should do something here.
        return;
      effectProps.applyMask(vp);
      this.setState({ isolate: effectProps.conIsolate ? false : undefined });
    }
  }

  private getControls(): React.ReactNode {
    return (
      <div className={"sample-options-2col"}>
        <label>BIM Model</label>
        <Toggle isOn={this.state.bimModel} onChange={(isChecked) => { this.setState({ bimModel: isChecked }); }} />
        <label>Reality Mesh</label>
        <Toggle isOn={this.state.realityMesh} onChange={(isChecked) => { this.setState({ realityMesh: isChecked }); }} />
        <label>Background Map</label>
        <Toggle isOn={this.state.backgroundMap} onChange={(isChecked) => { this.setState({ backgroundMap: isChecked }); }} />
        <label>Masking</label>
        <Select options={[...this._predefinedProps.keys()]} value={this.state.storedPropsName} onChange={(event) => this.setState({ storedPropsName: event.target.value })} />
        <label>Isolate Elements</label>
        <Toggle isOn={this.state.isolate ?? false} disabled={this.state.isolate === undefined} onChange={(isChecked) => { if (this.state.isolate !== undefined) this.setState({ isolate: isChecked }); }} />
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
