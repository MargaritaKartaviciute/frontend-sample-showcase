/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { useEffect } from "react";
import { ColorByName, ColorDef } from "@bentley/imodeljs-common";
import { GeometryDecorator } from "common/Geometry/GeometryDecorator";
import { Button, NumberInput, Select } from "@bentley/ui-core";
import { Loop, Point3d } from "@bentley/geometry-core";
import Transformations2dApp from "./2dTransformationsApp";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@bentley/ui-abstract";

export interface ControlsWidgetProps {
  decorator: GeometryDecorator;
}

export const Transformations2dWidget: React.FunctionComponent<ControlsWidgetProps> = (props: ControlsWidgetProps) => {
  const [shape, setShape] = React.useState<string>("Square");
  const [xTrans, setXTrans] = React.useState<number>(1);
  const [yTrans, setYTrans] = React.useState<number>(1);
  const [rotationDeg, setRotationDeg] = React.useState<number>(180);
  const [geometry, setGeometry] = React.useState<Loop>(Transformations2dApp.generateSquare(Point3d.create(0, 0), 4));
  const [geoUpdate, setGeoUpdate] = React.useState<Boolean>(true);

  useEffect(() => {
    _applyGeometry();
  });

  const _applyGeometry = () => {
    if (geometry) {
      props.decorator.clearGeometry();
      props.decorator.setColor(ColorDef.fromTbgr(ColorDef.withTransparency(ColorDef.create(ColorByName.cyan).tbgr, 50)));
      props.decorator.setLineThickness(5);
      props.decorator.addGeometry(geometry);
    }
  };

  const generateBaseGeometry = (newShape: string) => {
    if (newShape === "Square") {
      setGeometry(Transformations2dApp.generateSquare(Point3d.create(0, 0), 4));
      setGeoUpdate(!geoUpdate);
    } else if (newShape === "Circle") {
      setGeometry(Transformations2dApp.generateCircle(Point3d.create(0, 0), 4));
    } else if (newShape === "Triangle") {
      setGeometry(Transformations2dApp.generateTriangle(Point3d.create(0, 4, 0), Point3d.create(-5, -2, 0), Point3d.create(5, -2, 0)));
    } else if (newShape === "Convex Hull") {
      const points: Point3d[] = [];
      points.push(Point3d.create(-8, -5, 1));
      points.push(Point3d.create(-6, -3, 1));
      points.push(Point3d.create(-8, 1, 1));
      points.push(Point3d.create(8, -4, 1));
      points.push(Point3d.create(0, 3, 1));
      points.push(Point3d.create(-10, -1, 1));
      points.push(Point3d.create(-7, -1, 1));
      points.push(Point3d.create(-7, -1, 1));
      points.push(Point3d.create(-7, -1, 1));
      points.push(Point3d.create(-4, 3, 1));
      setGeometry(Transformations2dApp.generateConvexHull(points));
    }
  };

  return (
    <>
      <div className="sample-options-2col" style={{ maxWidth: "350px" }}>
        <span>Shape:</span>
        <Select options={["Square", "Circle", "Triangle", "Convex Hull"]} onChange={(event) => { setShape(event.target.value); generateBaseGeometry(event.target.value); }} />
      </div>
      <div className="sample-options-4col" style={{ maxWidth: "350px" }}>
        <span>Translate X</span>
        <NumberInput value={1} onChange={(value) => { if (value) setXTrans(value); }}></NumberInput>
        <Button onClick={() => { const newGeometry = Transformations2dApp.handleTranslation(geometry, -xTrans, 0); if (newGeometry) setGeometry(newGeometry); setGeoUpdate(!geoUpdate); }}>Shift Left</Button>
        <Button onClick={() => { const newGeometry = Transformations2dApp.handleTranslation(geometry, xTrans, 0); if (newGeometry) setGeometry(newGeometry); setGeoUpdate(!geoUpdate); }}>Shift Right</Button>

        <span>Translate Y</span>
        <NumberInput value={1} onChange={(value) => { if (value) setYTrans(value); }}></NumberInput>
        <Button onClick={() => { const newGeometry = Transformations2dApp.handleTranslation(geometry, 0, yTrans); if (newGeometry) setGeometry(newGeometry); setGeoUpdate(!geoUpdate); }}>Shift Up</Button>
        <Button onClick={() => { const newGeometry = Transformations2dApp.handleTranslation(geometry, 0, -yTrans); if (newGeometry) setGeometry(newGeometry); setGeoUpdate(!geoUpdate); }}>Shift Down</Button>

        <span>Rotate:</span>
        <NumberInput value={180} onChange={(value) => { if (value) setRotationDeg(value); }}></NumberInput>
        <Button onClick={() => { const newGeometry = Transformations2dApp.handleRotation(geometry, rotationDeg); if (newGeometry) setGeometry(newGeometry); setGeoUpdate(!geoUpdate); }}>Rotate Left</Button>
        <Button onClick={() => { const newGeometry = Transformations2dApp.handleRotation(geometry, -rotationDeg); if (newGeometry) setGeometry(newGeometry); setGeoUpdate(!geoUpdate); }}>Rotate Right</Button>

      </div>
      <Button onClick={() => { generateBaseGeometry(shape); }}>Reset</Button>
    </>
  );

};


export class Transformations2dWidgetProvider implements UiItemsProvider {
  public readonly id: string = "ViewerOnly2dWidgetProvider";
  private decorator: GeometryDecorator;
  constructor(decorator: GeometryDecorator) {
    this.decorator = decorator;
  }

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right) {
      widgets.push(
        {
          id: "2dTransformationsWidget",
          label: "2D Transformations",
          defaultState: WidgetState.Floating,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => <Transformations2dWidget decorator={this.decorator} />,
        }
      );
    }
    return widgets;
  }
}
