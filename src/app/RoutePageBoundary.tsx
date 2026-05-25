import { Suspense, type ReactNode } from "react";
import Button from "../components/Button";
import ErrorBoundary from "../components/ErrorBoundary";
import ErrorState from "../components/ErrorState";
import AppLoader from "../components/loader";

type RoutePageBoundaryProps = {
  children: ReactNode;
};

const routeErrorFallback = (
  <ErrorState
    title="שגיאה בטעינת העמוד"
    message="אפשר לרענן את העמוד ולנסות שוב."
    action={
      <Button type="button" onClick={() => window.location.reload()}>
        טען מחדש
      </Button>
    }
  />
);

const RoutePageBoundary = ({ children }: RoutePageBoundaryProps) => (
  <ErrorBoundary fallback={routeErrorFallback}>
    <Suspense fallback={<AppLoader variant="page" label="טוען עמוד..." />}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

export default RoutePageBoundary;
