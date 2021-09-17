/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import {
  AbstractWidgetProps,
  PrimitiveValue,
  PropertyDescription,
  PropertyRecord,
  PropertyValue,
  PropertyValueFormat,
  StagePanelLocation,
  StagePanelSection,
  UiItemsProvider,
  WidgetState
} from "@bentley/ui-abstract";
import { ColumnDescription, RowItem, SelectionMode, SimpleTableDataProvider, Table, TableSelectionTarget } from "@bentley/ui-components";
import React, { useCallback, useEffect, useState } from "react";
import DesignElementClassificationApi from "./DesignElementClassificationApi";
import { IModelApp } from "@bentley/imodeljs-frontend";
import { Slider, Spinner, SpinnerSize } from "@bentley/ui-core";
import DesignElementClassificationClient from "./DesignElementClassificationClient";

interface Misclassifications {
  failures: any[],
  failuresSchema: any,
  predictionLabels: string[],
  currentLabels: string[]
}

const DesignElementClassificationTableWidget: React.FunctionComponent = () => {
  const defaultConfidenceValue = 0.6;
  const elements: { [key: string]: string } = {};

  const [filteredData, setfilteredData] = useState([]);
  const [misclassifications, setMisclassifications] = useState<Misclassifications>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    DesignElementClassificationClient.getClassificationPredictionResults(DesignElementClassificationApi.Run_Id)
      .then(data => {
        setMisclassifications({
          ...misclassifications,
          predictionLabels: data.mlClassStringMap,
          currentLabels: data.categoryLabelStringMap,
          failures: data.classificationFailures,
          failuresSchema: data.classificationFailuresSchema
        });
        setLoading(false);
      });
    return () => undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (loading === false && misclassifications?.failures)
      setfilteredData(misclassifications?.failures.filter((item) => item[misclassifications?.failuresSchema.Top1Confidence.index] >= defaultConfidenceValue) as [])

    return () => undefined;
  }, [loading, misclassifications]);

  const _getDataProvider = useCallback((): SimpleTableDataProvider => {

    // adding columns
    const columns: ColumnDescription[] = [];

    columns.push({ key: "element_id", label: "Instance id", sortable: true });
    columns.push({ key: "current_class", label: "Original class", sortable: true });
    columns.push({ key: "max_class", label: "Predicted class", sortable: true });
    columns.push({ key: "max_class_confidence", label: "Predicted class confidence", sortable: true });

    const dataProvider = new SimpleTableDataProvider(columns);

    if (loading)
      return dataProvider;

    let categoryLabelSchema = misclassifications?.failuresSchema.CategoryLabel;
    let misclassifiedLabelSchema = misclassifications?.failuresSchema.Top1Prediction;
    let misclassifiedConfidence = misclassifications?.failuresSchema.Top1Confidence;

    // adding rows => cells => property record => value and description.
    filteredData.forEach((rowData) => {
      const rowItemKey = `${rowData[0]}`;
      const rowItem: RowItem = { key: rowItemKey, cells: [] };

      columns.forEach((column: ColumnDescription) => {
        let cellValue = '';

        switch (column.key) {
          case "element_id":
            cellValue = rowData[0];
            break;
          case "current_class":
            cellValue = misclassifications?.currentLabels[rowData[categoryLabelSchema.index]] ?? '';
            break;
          case "max_class":
            cellValue = misclassifications?.predictionLabels[rowData[misclassifiedLabelSchema.index]] ?? '';
            break;
          case "max_class_confidence":
            cellValue = `${rowData[misclassifiedConfidence.index]}`;
            break;
        }

        const value: PropertyValue = { valueFormat: PropertyValueFormat.Primitive, value: cellValue };
        const description: PropertyDescription = { displayLabel: column.label, name: column.key, typename: "string" };
        rowItem.cells.push({ key: column.key, record: new PropertyRecord(value, description) });
      });

      dataProvider.addRow(rowItem);
    })
    return dataProvider;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredData])

  // zooming into and highlighting element when row is selected.
  const _onRowsSelected = async (rowIterator: AsyncIterableIterator<RowItem>): Promise<boolean> => {
    if (!IModelApp.viewManager.selectedView)
      return true;

    // adds selected table rows data to dictionary.
    for await (const rowItem of rowIterator)
      elements[rowItem.key] = (rowItem.cells[2].record?.value as PrimitiveValue).value as string

    DesignElementClassificationApi.visualizeElements(elements);
    return true;
  };

  // removes highlight of element when row is deselected.
  const _onRowsDeselected = async (rowIterator: AsyncIterableIterator<RowItem>): Promise<boolean> => {

    // deletes deselected table rows data from dictionary.
    for await (const rowItem of rowIterator)
      delete elements[rowItem.key]

    DesignElementClassificationApi.visualizeElements(elements);
    return true;
  };

  // filters table data when slider value changes
  const _onSliderValueChanged = (values: ReadonlyArray<number>) => {
    DesignElementClassificationApi.clearMisclassifiedEmphasizeElements();

    if (misclassifications?.failures)
      setfilteredData(misclassifications.failures.filter((item) => item[misclassifications?.failuresSchema.Top1Confidence.index] >= values[0]) as []);
  };

  return (
    <>
      {!misclassifications ? <div><Spinner size={SpinnerSize.Small} /> Loading ...</div> :
        <div className="full-height">
          <div className="sample-options">
            <span>Predicted class confidence slider:</span>
            <Slider
              className="sample-options-center"
              min={0}
              max={1}
              values={[defaultConfidenceValue]}
              step={0.01}
              showTooltip
              showMinMax
              showTickLabels
              showTicks
              getTickCount={() => 20}
              onChange={_onSliderValueChanged}
            />
          </div>
          <Table
            dataProvider={_getDataProvider()}
            stripedRows={true}
            selectionMode={SelectionMode.Multiple}
            tableSelectionTarget={TableSelectionTarget.Row}
            onRowsSelected={_onRowsSelected}
            onRowsDeselected={_onRowsDeselected}
          />
        </div>
      }
    </>
  );
};

export class DesignElementClassificationTableWidgetProvider implements UiItemsProvider {
  public readonly id: string = "DesignElementClassificationTableWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Bottom) {
      widgets.push(
        {
          id: "DesignElementClassificationTableWidget",
          label: "Design Element Classification Selector",
          defaultState: WidgetState.Open,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => <DesignElementClassificationTableWidget />,
        }
      );
    }
    return widgets;
  }
}
