/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { FunctionComponent, useEffect, useState } from "react";
import "./SampleVisualizer.scss";
export interface VisualizerContentProps {
  classComponent: React.ComponentClass;
}

export const SampleVisualizerContent: FunctionComponent<VisualizerContentProps> = ({ classComponent }) => {
  const [sampleUi, setSampleUi] = useState<React.ReactNode | null>(null);

  useEffect(() => {
    if (classComponent) {
      setSampleUi(React.createElement(classComponent));
    } else {
      setSampleUi(null);
    }
  }, [classComponent]);

  return <div id="sample-container">
    {sampleUi}
  </div>;
};

