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

const DesignElementClassificationTableWidget: React.FunctionComponent = () => {
  const elements: { [key: string]: string } = {};

  const [filteredData, setfilteredData] = useState([]);
  const [misclassifications, setMisclassifications] = useState<any>();
  const [loading, setLoading] = useState(true);
  const [sliderValue, setSliderValue] = useState(0.6);

  useEffect(() => {
    DesignElementClassificationApi.getMisclassificationData()
      .then(data => {
        if (data) {
          console.log(data)
          setMisclassifications(data);
          setLoading(false);
        }
      });
    return () => undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (loading === false && misclassifications)
      setfilteredData(misclassifications.classificationFailures.filter((item: []) => item[misclassifications.classificationFailuresSchema.Confidence.index] >= sliderValue) as [])
    return () => undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, misclassifications]);

  const _getDataProvider = useCallback((): SimpleTableDataProvider => {

    // adding columns
    const columns: ColumnDescription[] = [];

    columns.push({ key: "ECInstanceId", label: "Instance id", sortable: true });
    columns.push({ key: "CategoryLabel", label: "Original class", sortable: true });
    columns.push({ key: "Top1Prediction", label: "Predicted class", sortable: true });
    columns.push({ key: "Top1Confidence", label: "Predicted class confidence", sortable: true });
    columns.push({ key: "Confidence", label: "Classification Confidence", sortable: true });

    const dataProvider = new SimpleTableDataProvider(columns);

    // adding rows => cells => property record => value and description.
    filteredData.forEach((rowData) => {
      const rowItemKey = `${rowData[0]}`;
      const rowItem: RowItem = { key: rowItemKey, cells: [] };

      columns.forEach((column: ColumnDescription) => {
        let cellValue = getCellValue(column.key, rowData);
        const value: PropertyValue = { valueFormat: PropertyValueFormat.Primitive, value: cellValue };
        const description: PropertyDescription = { displayLabel: column.label, name: column.key, typename: "string" };
        rowItem.cells.push({ key: column.key, record: new PropertyRecord(value, description) });
      });

      dataProvider.addRow(rowItem);
    })
    console.log(dataProvider)
    return dataProvider;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredData])

  const getCellValue = (columKey: string, rowData: any) => {
    let schemaValue = misclassifications?.classificationFailuresSchema[columKey]
    let index = schemaValue?.index;
    let stringMap = schemaValue?.stringMap;
    let cellValue = stringMap ? misclassifications[stringMap][rowData[index]] : `${rowData[index]}`;
    return cellValue;
  }

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

    setSliderValue(values[0]);

    if (misclassifications?.classificationFailures)
      setfilteredData(misclassifications.classificationFailures.filter((item: []) => item[misclassifications?.classificationFailuresSchema.Confidence.index] >= values[0]) as []);
  };

  return (
    <>
      {loading ? <div><Spinner size={SpinnerSize.Small} /> Loading ...</div> :
        <div className="full-height">
          <div className="sample-options">
            <span>Predicted class confidence slider:</span>
            <Slider
              className="sample-options-center"
              min={0}
              max={1}
              values={[sliderValue]}
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
