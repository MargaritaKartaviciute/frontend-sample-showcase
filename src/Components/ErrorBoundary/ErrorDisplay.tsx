/*---------------------------------------------------------------------------------------------
|  $Copyright: (c) 2020 Bentley Systems, Incorporated. All rights reserved. $
 *--------------------------------------------------------------------------------------------*/
import { IRuntimeError, SourceMapStack } from "@bentley/monaco-editor";
import React, { FunctionComponent } from "react";
import "./ErrorDisplay.scss";

export interface DisplayErrorProps {
  error?: IRuntimeError | Error;
}

function isRuntimeError(error: IRuntimeError | Error): error is IRuntimeError {
  return !!(error as IRuntimeError).sourceMapStack;
}

const mapTrace = (trace: SourceMapStack) => (
  <>
    <div>
      {trace.name}
    </div>
    <div className="stack-source-container">
      <span className="stack-source">
        {trace.source}:{trace.line}:{trace.column}
      </span>
    </div>
  </>
);

export const DisplayError: FunctionComponent<DisplayErrorProps> = ({ error }) => {
  if (error) {
    const stack: React.ReactNode[] = [];
    let hiddenStack: React.ReactNode[] = [];

    if (isRuntimeError(error)) {
      error.sourceMapStack.forEach((trace) => {
        if (trace.snippet) {
          if (hiddenStack.length) {
            stack.push(<div>
              <HiddenTraces stack={hiddenStack} />
            </div>);
            hiddenStack = [];
          }
          let currentLine = trace.line - 2;
          currentLine = currentLine <= 0 ? 1 : currentLine;
          stack.push(<div>
            {mapTrace(trace)}
            <span className="stack-snippet-container">
              <pre>
                <code>
                  {trace.snippet.map((snip, index) => {
                    return (
                      <>
                        <span data-ansi-line="true">
                          <span className="snippet-content">{currentLine + index === trace.line ? ">" : " "}</span>
                          <span className="snippet-content"> {currentLine + index} | </span>
                          <span className="snippet-content">{snip}</span>
                        </span>
                        <br />
                      </>);
                  })}
                </code>
              </pre>
            </span>
          </div>);
        } else {
          hiddenStack.push(mapTrace(trace));
        }
      });

      if (hiddenStack.length) {
        stack.push(<div>
          <HiddenTraces stack={hiddenStack} />
        </div>);
      }

      return (
        <div id="error-overlay">
          <div id="error-container">
            <div id="error-column">
              <div id="error-message">
                {error.name}: {error.message}
              </div>
              <div id="error-stack">
                {stack}
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      return (<div id="error-overlay">
        <div id="error-container">
          <div id="error-column">
            <div id="error-message">
              {error.name}: {error.message}
            </div>
          </div>
        </div>
      </div>);
    }
  }
  return null;
};

const HiddenTraces: React.FunctionComponent<{ stack: React.ReactNode[] }> = ({ stack }) => {
  const [display, setDisplay] = React.useState<"none" | "block">("none");

  const onReveal = React.useCallback(() => {
    setDisplay("block");
  }, [setDisplay]);

  const onHide = React.useCallback(() => {
    setDisplay("none");
  }, [setDisplay]);

  return (
    <>
      <button className="reveal-stack" style={{ display: display === "none" ? "block" : "none" }} onClick={onReveal}>
        ▶ {stack.length} stack frames were collapsed.
      </button>
      <div style={{ display }}>
        {stack}
        <button className="hide-stack" onClick={onHide}>
          ▲ {stack.length} stack frames were expanded.
        </button>
      </div>
    </>
  );

};
