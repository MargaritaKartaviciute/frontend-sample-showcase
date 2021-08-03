/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { FunctionComponent, useCallback, useEffect, useState } from "react";
import { IModelApp } from "@bentley/imodeljs-frontend";
import { Presentation } from "@bentley/presentation-frontend";
import { UiFramework } from "@bentley/ui-framework";
import { UiCore } from "@bentley/ui-core";
import { UiComponents } from "@bentley/ui-components";
import { AuthorizationClient } from "@itwinjs-sandbox/authentication/AuthorizationClient";
import { DisplayError } from "Components/ErrorBoundary/ErrorDisplay";
import { ErrorBoundary } from "Components/ErrorBoundary/ErrorBoundary";
import { SampleVisualizerContent } from "./SampleVisualizerContent";
import { ProgressRadial } from "@itwin/itwinui-react";
const context = (require as any).context("./../../frontend-samples", true, /\.tsx$/);

interface SampleVisualizerProps {
  type: string;
  iModelName: string;
  iModelSelector: React.ReactNode;
  transpileResult?: string;
}

const iModelAppShutdown = async (): Promise<void> => {
  try {
    Presentation.presentation.dispose();
  } catch (err) {
    // Do nothing, its possible that we never started.
  }
  try {
    Presentation.terminate();
  } catch (err) {
    // Do nothing, its possible that we never started.
  }
  if (UiFramework.initialized) {
    try {
      UiFramework.terminate();
    } catch (err) {
      // Do nothing.
    }
  }
  if (UiComponents.initialized) {
    try {
      UiComponents.terminate();
    } catch (err) {
      // Do nothing.
    }
  }
  if (UiCore.initialized) {
    try {
      UiCore.terminate();
    } catch (err) {
      // Do nothing
    }
  }
  try {
    IModelApp.i18n.languageList().forEach((ns) => IModelApp.i18n.unregisterNamespace(ns));
  } catch (err) {
    // Do nothing
  }
  if (IModelApp.initialized) {
    try {
      await IModelApp.shutdown();
    } catch (err) {
      // Do nothing
    }
  }
};

const SampleVisualizer: FunctionComponent<SampleVisualizerProps> = ({ type, transpileResult }) => {
  const [componentType, setComponentType] = useState<React.ComponentClass | undefined>();
  const [retryCount, setRetryCount] = useState<number>(-1);

  useEffect(() => {
    setComponentType(undefined);
    setRetryCount(0);
    (async () => {
      while (IModelApp.initialized || UiCore.initialized || UiComponents.initialized || UiFramework.initialized) {
        await iModelAppShutdown();
      }
      await AuthorizationClient.initializeOidc();
      let module: { default: React.ComponentClass } | undefined;
      if (transpileResult) {
        module = await import( /* webpackIgnore: true */ transpileResult);
      } else {
        const key = context.keys().find((k: string) => k.includes(type));
        if (key) {
          const component = context(key);
          module = component;
        }
      }
      if (module !== undefined) {
        setComponentType(() => module!.default);
      }
    })().catch((_err) => {
      setComponentType(undefined);
      // eslint-disable-next-line no-console
      // console.error(error);
    });
  }, [type, transpileResult]);

  const onError = useCallback(async () => {
    if (retryCount < 3) {
      await iModelAppShutdown();
      await AuthorizationClient.initializeOidc();
      setRetryCount((prev) => prev + 1);
    }
  }, [retryCount]);

  if (!componentType) {
    return <ProgressRadial indeterminate={true} size="large" />;
  }

  return <ErrorBoundary key={retryCount} onInitError={onError} fallback={DisplayError} >
    <SampleVisualizerContent key={retryCount} classComponent={componentType} />
  </ErrorBoundary>;
};

export default SampleVisualizer;
