/*---------------------------------------------------------------------------------------------
|  $Copyright: (c) 2020 Bentley Systems, Incorporated. All rights reserved. $
 *--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { IRuntimeError } from "@bentley/monaco-editor";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: IRuntimeError | Error;
  errorInfo?: React.ErrorInfo;
}

export interface ErrorBoundaryProps {
  onInitError: () => void;
  fallback: (props: { error: Error | undefined, errorInfo: React.ErrorInfo | undefined }) => React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  private promiseRejectionHandler = (event: PromiseRejectionEvent) => {
    if (typeof event.reason === "string") {
      if (event.reason.match(/Cancelled|authorizationClient|Error obtaining default viewState|PropertyValueRendererManager.registerRenderer error|NotInitialized/i)) {
        this.props.onInitError();
        return;
      }
    }
    this.setState({ hasError: true, error: event.reason });
  };

  public componentDidMount() {
    // Add an event listener to the window to catch unhandled promise rejections & stash the error in the state
    window.addEventListener("unhandledrejection", this.promiseRejectionHandler);
  }

  public componentWillUnmount() {
    window.removeEventListener("unhandledrejection", this.promiseRejectionHandler);
  }

  public async componentDidCatch(error: Error, errorInfo: React.ErrorInfo): Promise<void> {
    // if (this.props.sourceMap) {
    //   this.setState({ hasError: true });
    // const result = await Bundler.getSourceMappedError(this.props.sourceMap, error);
    // this.setState({ error, errorInfo });
    // } else {
    this.setState({ hasError: true, error, errorInfo });
    // }
  }

  public render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback({ error: this.state.error, errorInfo: this.state.errorInfo })
      );
    }
    return this.props.children;
  }
}
