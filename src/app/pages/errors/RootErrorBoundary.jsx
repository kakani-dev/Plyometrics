// Import Depndencies
import { isRouteErrorResponse, useRouteError } from "react-router";
import { lazy } from "react";

// Local Imports
import { Loadable } from "components/shared/Loadable";

// ----------------------------------------------------------------------

import { Page } from "components/shared/Page";

const app = {
  401: Loadable(lazy(() => import("./401"))),
  404: Loadable(lazy(() => import("./404"))),
  429: Loadable(lazy(() => import("./429"))),
  500: Loadable(lazy(() => import("./500"))),
};

function RootErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    const Component = app[error.status] || app[500];
    return <Component />;
  }

  const errorMessage = error instanceof Error ? error.message : typeof error === "string" ? error : "An unexpected error occurred";
  const errorStack = error instanceof Error ? error.stack : null;

  return (
    <Page title="Application Error">
      <main className="min-h-100vh relative grid w-full grow grid-cols-1 place-items-center p-4">
        <div className="w-full max-w-2xl text-center">
          <div className="inline-flex size-16 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
            <svg className="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="pt-6 text-2xl font-bold tracking-tight text-gray-900 dark:text-dark-50">
            Something went wrong
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-500 dark:text-dark-400">
            An unexpected error occurred in the application. Please try reloading or go back to home.
          </p>

          <div className="mt-6 rounded-lg border border-red-200 bg-red-50/50 p-4 text-left dark:border-red-900/30 dark:bg-red-950/10">
            <div className="font-mono text-sm font-semibold text-red-800 dark:text-red-400">
              {errorMessage}
            </div>
            {errorStack && (
              <pre className="mt-2 max-h-60 overflow-auto whitespace-pre-wrap font-mono text-xs text-red-600/80 dark:text-red-400/75">
                {errorStack}
              </pre>
            )}
          </div>

          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={() => window.location.reload()}
              className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              Reload Page
            </button>
            <button
              onClick={() => window.location.href = "/"}
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-dark-500 dark:bg-dark-800 dark:text-dark-200 dark:hover:bg-dark-700"
            >
              Go to Home
            </button>
          </div>
        </div>
      </main>
    </Page>
  );
}

export default RootErrorBoundary;
