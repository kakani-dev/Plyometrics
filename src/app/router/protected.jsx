// Import Dependencies
import { Navigate } from "react-router";

// Local Imports
import { AppLayout } from "app/layouts/AppLayout";
import { DynamicLayout } from "app/layouts/DynamicLayout";
import AuthGuard from "middleware/AuthGuard";

// ----------------------------------------------------------------------

const protectedRoutes = {
  id: "protected",
  Component: AuthGuard,
  children: [
    // The dynamic layout supports both the main layout and the sideblock.
    {
      Component: DynamicLayout,
      children: [
        {
          index: true,
          element: <Navigate to="/dashboards" />,
        },
        {
          path: "dashboards",
          children: [
            {
              index: true,
              element: <Navigate to="/dashboards/home" />,
            },
            {
              path: "home",
              lazy: async () => ({
                Component: (await import("app/pages/dashboards/home")).default,
              }),
            },
            {
              path: "user-screen",
              lazy: async () => ({
                Component: (await import("app/pages/dashboards/UserScreen")).default,
              }),
            },
            {
              path: "counselor-screen",
              lazy: async () => ({
                Component: (await import("app/pages/dashboards/CounselorScreen")).default,
              }),
            },
            {
              path: "assessment-ui",
              lazy: async () => ({
                Component: (await import("app/pages/dashboards/AssessmentUI")).default,
              }),
            },
            {
              path: "report",
              lazy: async () => ({
                Component: (await import("app/pages/dashboards/CombinedReport")).default,
              }),
            },
            {
              path: "user-exam-report",
              element: <Navigate to="/dashboards/report" replace />,
            },
            {
              path: "user-response",
              element: <Navigate to="/dashboards/report" replace />,
            },
            {
              path: "marks-report",
              element: <Navigate to="/dashboards/report" replace />,
            },
          ],
        },
      ],
    },
    // The app layout supports only the main layout. Avoid using it for other layouts.
    {
      Component: AppLayout,
      children: [
        {
          path: "settings",
          lazy: async () => ({
            Component: (await import("app/pages/settings/Layout")).default,
          }),
          children: [
            {
              index: true,
              element: <Navigate to="/settings/general" />,
            },
            {
              path: "general",
              lazy: async () => ({
                Component: (await import("app/pages/settings/sections/General"))
                  .default,
              }),
            },
            {
              path: "appearance",
              lazy: async () => ({
                Component: (
                  await import("app/pages/settings/sections/Appearance")
                ).default,
              }),
            },
          ],
        },
      ],
    },
  ],
};

export { protectedRoutes };
