/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { FunctionComponent, useCallback, useEffect, useState } from "react";
import { CollapsiblePane, Pane, SplitScreen, Splitter } from "@bentley/monaco-editor";
import { Button, ButtonSize, ButtonType } from "@bentley/ui-core/lib/ui-core/button/Button";
import { SampleShowcaseViewHandlerProps } from "./SampleShowcaseViewHandler";
import "./SampleShowcaseSplitPane.scss";

export interface SampleShowcaseSplitPaneProps extends SampleShowcaseViewHandlerProps {
  width: number;
}

interface Sizes {
  threshold: number;
  maxSize?: number;
  minSize?: number;
  size?: number;
}

interface PaneSizes {
  editor: Sizes;
  preview: Partial<Sizes>;
  gallery: Sizes;
}

const calculateSizes = (width: number): PaneSizes => {
  if (width >= 1024) {
    return {
      editor: {
        threshold: Math.floor(width * 0.15),
        maxSize: Math.floor(width * 0.5),
      },
      preview: {
        minSize: Math.floor(width * 0.4),
      },
      gallery: {
        threshold: 100,
        maxSize: 200,
      },
    };
  } else if (width < 1024 && width >= 768) {
    return {
      editor: {
        threshold: Math.floor(width * 0.33),
        maxSize: Math.floor(width * 0.6),
      },
      preview: {
        // minSize: Math.floor(width * 0.5),
      },
      gallery: {
        threshold: Math.floor(width * 0.15),
        maxSize: Math.floor(width * 0.3),
      },
    };
  } else if (width < 768 && width >= 576) {
    return {
      editor: {
        threshold: Math.floor(width * 0.4),
        maxSize: Math.floor(width * 0.6),
      },
      preview: {
        // minSize: Math.floor(width * 0.5),
      },
      gallery: {
        threshold: 125,
        maxSize: Math.floor(width * 0.33),
      },
    };
  } else {
    return {
      editor: {
        threshold: width,
        maxSize: width,
        minSize: width,
      },
      preview: {
        // minSize: width,
      },
      gallery: {
        threshold: width,
        maxSize: width,
        minSize: width,
      },
    };
  }
};

export const SampleShowcaseSplitPane: FunctionComponent<SampleShowcaseSplitPaneProps> = ({ width, editor, visualizer, gallery }) => {
  const [sizes, setSizes] = useState<PaneSizes>(calculateSizes(width));
  const [showEditor, setShowEditor] = useState(width >= 1024);
  const [showGallery, setShowGallery] = useState(width >= 576 && !!gallery);

  useEffect(() => {
    setSizes(calculateSizes(width));
  }, [width]);

  const editorClassName = ["editor-pane"];
  const galleryClassName = ["gallery-pane"];

  width < 576 && showEditor && editorClassName.push("mobile-visible");
  width < 576 && showGallery && galleryClassName.push("mobile-visible");

  const onGalleryButtonClick = useCallback(() => {
    if (width < 1024 && !showGallery && showEditor) {
      setShowEditor(false);
    }
    setShowGallery(!showGallery);
  }, [showGallery, showEditor, width]);

  const onEditorButtonClick = useCallback(() => {
    if (width < 1024 && !showEditor && showGallery) {
      setShowGallery(false);
    }
    setShowEditor(!showEditor);
  }, [showEditor, showGallery, width]);

  const onEditorCollapse = useCallback(() => {
    setShowEditor(false);
  }, []);

  const onGalleryCollapse = useCallback(() => {
    setShowGallery(false);
  }, []);

  return (
    <SplitScreen split="vertical" windowResizeAware={true}>
      <CollapsiblePane {...sizes.editor} size={!showEditor ? 0.0000001 : undefined} flex={!showEditor ? 0.0000001 : undefined} onCollapse={onEditorCollapse} direction={1}>
        {width < 576 && <Button size={ButtonSize.Large} buttonType={ButtonType.Blue} className="hide-panel hide-code-button" onClick={onEditorButtonClick}><span className="icon icon-chevron-left"></span></Button>}
        {editor}
      </CollapsiblePane>
      <Splitter disabled={!showEditor} propagate={true} />
      <Pane className={"preview"} {...sizes.preview} direction={showGallery && showEditor ? [-1, 1] : showEditor && !showGallery ? -1 : 1}>
        {((width < 576 && !showGallery) || width >= 576) && !showEditor && <Button size={ButtonSize.Large} buttonType={ButtonType.Blue} className="show-panel show-code-button" onClick={onEditorButtonClick}><span className="icon icon-chevron-right"></span></Button>}
        {showEditor && <Button size={ButtonSize.Large} buttonType={ButtonType.Blue} className="hide-panel hide-code-button" onClick={onEditorButtonClick}><span className="icon icon-chevron-left"></span></Button>}
        {visualizer}
        {((width < 576 && !showEditor) || width >= 576) && !showGallery && <Button size={ButtonSize.Large} buttonType={ButtonType.Blue} className="show-panel show-gallery-button" onClick={onGalleryButtonClick}><span className="icon icon-chevron-left"></span></Button>}
        {showGallery && <Button size={ButtonSize.Large} buttonType={ButtonType.Blue} className="hide-panel hide-gallery-button" onClick={onGalleryButtonClick}><span className="icon icon-chevron-right"></span></Button>}
      </Pane>
      {!!gallery && <Splitter disabled={!showGallery} propagate={true} />}
      {!!gallery && <CollapsiblePane {...sizes.gallery} size={!showGallery ? 0.0000001 : undefined} flex={!showGallery ? 0.0000001 : undefined} onCollapse={onGalleryCollapse} direction={-1}>
        {width < 576 && <Button size={ButtonSize.Large} buttonType={ButtonType.Blue} className="hide-panel hide-gallery-button" onClick={onGalleryButtonClick}><span className="icon icon-chevron-right"></span></Button>}
        {gallery}
      </CollapsiblePane>}
    </SplitScreen >
  );
};
