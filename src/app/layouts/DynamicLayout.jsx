// Import Dependencies
import { lazy } from "react";

// Local Imports
import { useThemeContext } from "app/contexts/theme/context";
import { Loadable } from "components/shared/Loadable";
import { SplashScreen } from "components/template/SplashScreen";

// ----------------------------------------------------------------------

const themeLayouts = {
  "main-layout": Loadable(lazy(() => import("./MainLayout")), SplashScreen),
  sideblock: Loadable(lazy(() => import("./Sideblock")), SplashScreen),
};

export function DynamicLayout() {
  const { themeLayout } = useThemeContext();
  const CurrentLayout = themeLayouts[themeLayout];

  return <CurrentLayout />;
}
