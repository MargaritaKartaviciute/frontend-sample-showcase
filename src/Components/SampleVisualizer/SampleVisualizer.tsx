/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { FunctionComponent, useCallback, useEffect, useRef, useState } from "react";
import { IModelApp } from "@bentley/imodeljs-frontend";
import { Presentation } from "@bentley/presentation-frontend";
// import { DisplayError } from "Components/ErrorBoundary/ErrorDisplay";
import { UiFramework } from "@bentley/ui-framework";
import { UiCore } from "@bentley/ui-core";
import { UiComponents } from "@bentley/ui-components";
import { SampleVisualizerContent } from "./SampleVisualizerContent";
import { AuthorizationClient } from "@itwinjs-sandbox/authentication/AuthorizationClient";
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
  try {
    if (UiFramework.initialized) {
      UiFramework.terminate();
    }
  } catch (err) {
    // Do nothing.
  }
  try {
    if (UiComponents.initialized) {
      UiComponents.terminate();
    }
  } catch (err) {
    // Do nothing.
  }
  try {
    if (UiCore.initialized) {
      UiCore.terminate();
    }
  } catch (err) {
    // Do nothing
  }
  try {
    IModelApp.i18n.languageList().forEach((ns) => IModelApp.i18n.unregisterNamespace(ns));
  } catch (err) {
    // Do nothing
  }
  try {
    await IModelApp.shutdown();
  } catch (err) {
    // Do nothing
  }
};

export const SampleVisualizer: FunctionComponent<SampleVisualizerProps> = ({ type, transpileResult }) => {
  const [componentType, setComponentType] = useState<React.ComponentClass | undefined>();
  const [key, setKey] = useState<number>(Math.random() * 100);

  useEffect(() => {
    (async () => {
      await iModelAppShutdown();
      await AuthorizationClient.initializeOidc();
      let module: { default: React.ComponentClass } | undefined;
      if (transpileResult) {
        module = await import( /* webpackIgnore: true */ transpileResult);
      }
      const key = context.keys().find((k: string) => k.includes(type));
      if (key) {
        const component = context(key);
        module = component;
      }
      if (module !== undefined) {
        setComponentType(() => module!.default);
      }
    })().catch((_err) => {
      setComponentType(undefined);
      // eslint-disable-next-line no-console
      // console.error(error);
    });

    return () => {
      setComponentType(undefined);
    };
  }, [type, transpileResult]);

  const onError = useCallback(async () => {
    await iModelAppShutdown();
    await AuthorizationClient.initializeOidc();
    setKey(Math.random() * 100);
  }, []);

  return <SampleVisualizerContent key={key} classComponent={componentType} onError={onError} />;
};

export default React.memo(SampleVisualizer, (prevProps, nextProps) => {
  return prevProps.type === nextProps.type && prevProps.iModelName === nextProps.iModelName && prevProps.transpileResult === nextProps.transpileResult;
});
