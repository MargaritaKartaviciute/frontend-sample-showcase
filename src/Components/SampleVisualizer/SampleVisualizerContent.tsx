/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { FunctionComponent, useEffect, useState } from "react";
// import { DisplayError } from "Components/ErrorBoundary/ErrorDisplay";
import { Spinner, SpinnerSize } from "@bentley/ui-core";
import { SampleErrorBoundary } from "./SampleErrorBoundary";

interface SampleVisualizerContentProps {
  classComponent?: React.ComponentClass;
  onError: () => void;
}

export const SampleVisualizerContent: FunctionComponent<SampleVisualizerContentProps> = ({ classComponent, onError }) => {
  const [sampleUi, setSampleUi] = useState<React.ReactNode | null>(null);

  useEffect(() => {
    if (classComponent) {
      setSampleUi(React.createElement(classComponent));
    } else {
      setSampleUi(null);
    }
  }, [classComponent]);

  if (!sampleUi) {
    return (<div className="uicore-fill-centered"><Spinner size={SpinnerSize.XLarge} /></div>);
  }

  return <SampleErrorBoundary onError={onError} >{sampleUi}</SampleErrorBoundary>;
};

