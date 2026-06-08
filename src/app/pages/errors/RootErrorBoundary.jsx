// Import Depndencies
import { isRouteErrorResponse, useRouteError } from "react-router";
import { lazy } from "react";

// Local Imports
import { Loadable } from "components/shared/Loadable";

// ----------------------------------------------------------------------

const app = {
  401: Loadable(lazy(() => import("./401"))),
  404: Loadable(lazy(() => import("./404"))),
  429: Loadable(lazy(() => import("./429"))),
  500: Loadable(lazy(() => import("./500"))),
};

function RootErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    const Component = app[error.status];
    return <Component />;
  }

  return <div>Something went wrong</div>;
}

export default RootErrorBoundary;
