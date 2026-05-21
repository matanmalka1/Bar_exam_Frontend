import { Component, type ErrorInfo, type ReactNode } from "react";
import Button from "./Button";
import Card from "./Card";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error("Unhandled React error", error, errorInfo);
    }
  }

  private reload = () => {
    window.location.reload();
  };

  private goHome = () => {
    window.location.assign("/");
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main
        dir="rtl"
        className="flex min-h-svh items-center justify-center bg-[var(--paper)] px-5 py-8 text-[var(--ink)]"
      >
        <Card className="w-full max-w-[420px] text-center">
          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl font-extrabold text-primary">
                משהו השתבש
              </h1>
              <p className="text-sm leading-6 text-secondary">
                אירעה שגיאה לא צפויה. אפשר לטעון מחדש את האפליקציה.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row-reverse">
              <Button type="button" fullWidth onClick={this.reload}>
                טען מחדש
              </Button>
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={this.goHome}
              >
                חזור לדף הבית
              </Button>
            </div>
          </div>
        </Card>
      </main>
    );
  }
}

export default ErrorBoundary;
