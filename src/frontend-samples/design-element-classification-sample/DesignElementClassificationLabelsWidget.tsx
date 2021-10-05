/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import {
  AbstractWidgetProps,
  StagePanelLocation,
  StagePanelSection,
  UiItemsProvider,
  WidgetState,
} from '@bentley/ui-abstract';
import { ColorPickerButton } from '@bentley/ui-components';
import * as React from 'react';
import { BodyText, Spinner, SpinnerSize, Toggle } from '@bentley/ui-core';
import DesignElementClassificationApi from './DesignElementClassificationApi';
import { useEffect, useState } from 'react';

const DesignElementClassificationLabelsWidget: React.FunctionComponent = () => {
  const [misclassifications, setMisclassifications] = useState<any>();
  const [loading, setLoading] = useState<boolean>(true);
  const [applyEmphasis, setApplyEmphasis] = useState<boolean>(true);
  const [imodelIds, setIModelIds] = useState<string[]>([]);

  useEffect(() => {
    DesignElementClassificationApi.getMisclassificationData()
      .then(data => {
        if (data) {
          setMisclassifications(data);
          setLoading(false);
        }
      });
    return () => undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loading && misclassifications) {
      let elementsIds = misclassifications.classificationFailures
        .map((x: []) => x[misclassifications.classificationFailuresSchema.ECInstanceId.index]) as string[]
      setIModelIds(elementsIds);
    }
    return () => undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, misclassifications]);

  // emphasize all misclassified elements when iModel loaded
  useEffect(() => {
    if (loading === false && imodelIds)
      DesignElementClassificationApi.emphasizeMisclassifiedElements(imodelIds);
    return () => undefined;
  }, [loading, imodelIds]);

  // enable or disable elements emphasis
  useEffect(() => {
    DesignElementClassificationApi.setEmphasisMode(applyEmphasis);
    return () => undefined;
  }, [applyEmphasis]);

  const _handleToggleChange = (wantEmphasis: boolean) => {
    if (!applyEmphasis && imodelIds)
      DesignElementClassificationApi.emphasizeMisclassifiedElements(imodelIds);
    else
      DesignElementClassificationApi.clearMisclassifiedEmphasizeElements();

    setApplyEmphasis(wantEmphasis);
  };

  // highlight all elements by selected label
  const _highlightElementsByLable = (label: string) => {
    let elementsIds = misclassifications?.classificationFailures
      .filter((item: []) => misclassifications.mlClassStringMap[item[misclassifications?.classificationFailuresSchema.Top1Prediction.index]] === label)
      .map((x: []) => x[misclassifications?.classificationFailuresSchema.ECInstanceId.index]) as string[];

    DesignElementClassificationApi.visualizeElementsByLabel(elementsIds, label);
  };

  return (
    <>
      {loading || !misclassifications ? <div><Spinner size={SpinnerSize.Small} /> Loading ...</div> :
        <div className="sample-options">
          <div className="sample-options-center">
            <span>Highlight misclassified elements</span>
            <Toggle isOn={applyEmphasis} showCheckmark={true} onChange={_handleToggleChange} />
          </div>
          <div className="header">
            <span>Misclassified elements labels:</span>
          </div>
          {
            misclassifications.mlClassStringMap?.map((label: string, index: number) => {
              return (
                <div key={index} onClick={() => _highlightElementsByLable(label)}>
                  <ColorPickerButton
                    className="sstc-color-picker-button"
                    initialColor={DesignElementClassificationApi.getLabelColor(label)}
                    disabled={true}
                  />
                  <div className="mltc-label-container-v2-small">
                    <BodyText>{label}</BodyText>
                  </div>
                </div>
              );
            })
          }
        </div>
      }
    </>
  );
};

export class DesignElementClassificationLabelsProvider implements UiItemsProvider {
  public readonly id = 'DesignElementClassificationLabelsProvider';

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right && section === StagePanelSection.Start) {
      widgets.push(
        {
          id: "DesignElementClassificationLabelsWidget",
          label: "Design Element Classification Categories",
          defaultState: WidgetState.Open,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => <DesignElementClassificationLabelsWidget />,
        }
      );
    }
    return widgets;
  }
}