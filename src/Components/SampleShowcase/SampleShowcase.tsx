/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { FunctionComponent, useCallback, useEffect, useState } from "react";
import { SampleGallery } from "Components/SampleGallery/SampleGallery";
import { sampleManifest } from "../../sampleManifest";
import { SplitScreen } from "@bentley/monaco-editor/lib/components/split-screen/SplitScreen";
import Pane from "@bentley/monaco-editor/lib/components/split-screen/Pane";
import { Button, ButtonSize, ButtonType } from "@bentley/ui-core/lib/ui-core/button/Button";
import { Spinner, SpinnerSize } from "@bentley/ui-core/lib/ui-core/loading/Spinner";
import { ErrorBoundary } from "Components/ErrorBoundary/ErrorBoundary";
import "./SampleShowcase.scss";
import "common/samples-common.scss";
import { IModelSelector } from "@itwinjs-sandbox/components/imodel-selector/IModelSelector";
import { ActiveSample } from "./ActiveSample";

const Editor = React.lazy(async () => import(/* webpackMode: "lazy" */ "../SampleEditor/SampleEditorContext"));
const Visualizer = React.lazy(async () => import(/* webpackMode: "lazy" */ "../SampleVisualizer/SampleVisualizer"));

export const SampleShowcase: FunctionComponent = () => {
  const [activeSample, setActiveSample] = useState(() => new ActiveSample());
  const [scrollTo, setScrollTo] = useState(true);
  const [showEditor, setShowEditor] = useState(true);
  const [showGallery, setShowGallery] = useState(true);
  const [transpileResult, setTranspileResult] = useState<string>();
  let dragging: boolean = false;
  let sizes: string[] = ["400px", "1", "200px"];

  const showcaseRef = React.createRef<HTMLDivElement>();
  const galleryRef = React.createRef<SampleGallery>();


  useEffect(() => {
    if (scrollTo && galleryRef.current) {
      galleryRef.current.scrollToActiveSample();
      setScrollTo(false);
    }
  }, [scrollTo, galleryRef]);

  const [editorMinSize, _, galleryMinSize] = sizes;

  const galleryClassName = dragging ? "gallery-pane dragging" : "gallery-pane";
  const editorClassName = dragging ? "editor-pane dragging" : "editor-pane";

  const onGalleryCardClicked = (groupName: string, sampleName: string, wantScroll: boolean) => {
    if (transpileResult && !window.confirm("Changes made to the code will not be saved!")) {
      return;
    }
    setScrollTo(wantScroll);
    setActiveSample(new ActiveSample(groupName, sampleName));
    setTranspileResult(undefined);
  };

  const onSampleGallerySizeChange = (sizePx: number) => {
    if (sizePx < 200 && showGallery) {
      setShowGallery(false);
    } else if (sizePx >= 200 && showEditor) {
      setShowGallery(true);
    }
  };

  const onEditorSizeChange = (sizePx: number) => {
    if (sizePx < 400 && showEditor) {
      setShowEditor(false);
    } else if (sizePx >= 400 && showEditor) {
      setShowEditor(true);
    }
  }

  const getImodelSelector = useCallback(() => {
    if (!activeSample.imodelList || !activeSample.imodelList.length)
      return undefined;

    return (
      <div className="model-selector">
        <IModelSelector
          iModelNames={activeSample.imodelList}
          iModelName={activeSample.imodel}
          onIModelChange={(imodelName) => setActiveSample(new ActiveSample(activeSample.group, activeSample.name, imodelName))} />
      </div>);
  }, [activeSample]);

  const spinner = (<div className="uicore-fill-centered" ><Spinner size={SpinnerSize.XLarge} /></div>);

  return (
    <div className="showcase" ref={showcaseRef}>
      <SplitScreen split="vertical" onResizeStart={() => dragging = true} onResizeEnd={() => dragging = false} onChange={(newSizes) => sizes = newSizes}>
        <Pane className={editorClassName} snapSize={"400px"} disabled={!showEditor} size={showEditor ? "400px" : "0"} onChange={onEditorSizeChange}>
          <React.Suspense fallback={spinner}>
            <Editor
              files={activeSample.getFiles}
              style={{ minWidth: editorMinSize }}
              onCloseClick={() => setShowEditor(!showEditor)}
              onSampleClicked={onGalleryCardClicked}
              onTranspiled={(blob) => setTranspileResult(blob)}
              readme={activeSample.getReadme} />
          </React.Suspense>
        </Pane>
        <Pane className="preview" minSize={"500px"}>
          {!showEditor && <Button size={ButtonSize.Large} buttonType={ButtonType.Blue} className="show-panel show-code-button" onClick={() => setShowEditor(!showEditor)}><span className="icon icon-chevron-right"></span></Button>}
          {showEditor && <Button size={ButtonSize.Large} buttonType={ButtonType.Blue} className="hide-panel hide-code-button" onClick={() => setShowEditor(!showEditor)}><span className="icon icon-chevron-left"></span></Button>}
          <div id="sample-container" className="sample-content" style={{ height: "100%" }}>
            <React.Suspense fallback={spinner}>
              <ErrorBoundary>
                <Visualizer
                  iModelName={activeSample.imodel}
                  iModelSelector={getImodelSelector()}
                  transpileResult={transpileResult}
                  sampleClass={activeSample.sampleClass} />
              </ErrorBoundary>
            </React.Suspense>
          </div>
          {!showGallery && <Button size={ButtonSize.Large} buttonType={ButtonType.Blue} className="show-panel show-gallery-button" onClick={() => setShowGallery(!showGallery)}><span className="icon icon-chevron-left"></span></Button>}
          {showGallery && <Button size={ButtonSize.Large} buttonType={ButtonType.Blue} className="hide-panel hide-gallery-button" onClick={() => setShowGallery(!showGallery)}><span className="icon icon-chevron-right"></span></Button>}
        </Pane>
        <Pane className={galleryClassName} snapSize={"200px"} maxSize={"20%"} disabled={!showGallery} size={showGallery ? "200px" : "0"} onChange={onSampleGallerySizeChange}>
          <SampleGallery
            group={activeSample.group}
            style={{ minWidth: galleryMinSize }}
            onChange={onGalleryCardClicked}
            ref={galleryRef}
            samples={sampleManifest}
            selected={activeSample.name} />
        </Pane>
      </SplitScreen>
    </div>
  )
}
