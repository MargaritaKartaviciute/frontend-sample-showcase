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
import DesignElementClassificationClient from './DesignElementClassificationClient';
import { useEffect, useState } from 'react';

interface Misclassifications {
  labels: string[],
  elementIds: string[],
  failures: any[],
}

const DesignElementClassificationLabelsWidget: React.FunctionComponent = () => {
  const [misclassifications, setMisclassifications] = useState<Misclassifications>();
  const [loading, setLoading] = useState(true);
  const [applyEmphasis, setApplyEmphasis] = useState<boolean>(true);

  useEffect(() => {
    DesignElementClassificationClient.getClassificationPredictionResults(DesignElementClassificationApi.Run_Id)
      .then(data => {
        setMisclassifications({
          ...misclassifications,
          labels: data.mlClassStringMap,
          elementIds: data.classificationFailures?.map((x: any[]) => x[0]),
          failures: data.classificationFailures
        });
        setLoading(false);
      });
    return () => undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // emphasize all misclassified elements when iModel loaded
  useEffect(() => {
    if (loading === false && misclassifications && misclassifications.elementIds)
      DesignElementClassificationApi.emphasizeMisclassifiedElements(misclassifications.elementIds);
  }, [loading, misclassifications]);

  // enable or disable elements emphasis
  useEffect(() => {
    if (applyEmphasis)
      DesignElementClassificationApi.setEmphasisMode(true);
    else
      DesignElementClassificationApi.setEmphasisMode(false);
  }, [applyEmphasis]);

  const _handleToggleChange = (wantEmphasis: boolean) => {
    if (!applyEmphasis && misclassifications)
      DesignElementClassificationApi.emphasizeMisclassifiedElements(misclassifications.elementIds);
    else
      DesignElementClassificationApi.clearMisclassifiedEmphasizeElements();

    setApplyEmphasis(wantEmphasis);
  };

  // highlight all elements by selected label
  const _highlightElementsByLable = (label: string) => {
    let elementsIds = misclassifications?.failures
      .filter(f => misclassifications.labels[f[13]] === label)
      .map((x) => x[0]) as string[];

    DesignElementClassificationApi.visualizeElementsByLabel(elementsIds, label);
  };

  return (
    <>
      {!misclassifications ? <div><Spinner size={SpinnerSize.Small} /> Loading ...</div> :
        <div className="sample-options">
          <div className="sample-options-center">
            <span>Highlight misclassified elements</span>
            <Toggle isOn={applyEmphasis} showCheckmark={true} onChange={_handleToggleChange} />
          </div>
          <div className="header">
            <span>Misclassified elements labels:</span>
          </div>
          {
            misclassifications.labels?.map((label, index) => {
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