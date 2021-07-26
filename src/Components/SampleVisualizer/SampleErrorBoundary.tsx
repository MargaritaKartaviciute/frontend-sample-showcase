import { Spinner, SpinnerSize } from "@bentley/ui-core";
import React, { Component, ErrorInfo } from "react";

interface SampleErrorBoundaryProps {
  onError: () => void;
}

interface State {
  error: any; // Could be an exception thrown in synchronous code or could be a rejection reason from a Promise, we don't care
}

export class SampleErrorBoundary extends Component<SampleErrorBoundaryProps, State> {
  constructor(props: SampleErrorBoundaryProps) {
    super(props);
    this.state = {
      error: null,
    };
  }

  private promiseRejectionHandler = (event: PromiseRejectionEvent) => {
    if (typeof event.reason === "string") {
      if (event.reason.match(/Cancelled|authorizationClient|Error obtaining default viewState|PropertyValueRendererManager.registerRenderer error|NotInitialized/i)) {
        this.props.onError();
      }
    }
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("Uncaught error:", error, errorInfo);
  }

  public componentDidMount() {
    // Add an event listener to the window to catch unhandled promise rejections & stash the error in the state
    window.addEventListener("unhandledrejection", this.promiseRejectionHandler);
  }

  public componentWillUnmount() {
    window.removeEventListener("unhandledrejection", this.promiseRejectionHandler);
  }

  public render() {
    if (this.state.error) {
      return <div className="uicore-fill-centered"><Spinner size={SpinnerSize.XLarge} /></div>;
    } else {
      return this.props.children;
    }
  }
}
