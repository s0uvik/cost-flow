import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Toaster } from "sonner";
import type { QueryClient } from "@tanstack/react-query";
import { PwaInstallPrompt } from "@/components/shared/PwaInstallPrompt";

interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <Outlet />
      <PwaInstallPrompt />
      <Toaster richColors position="top-right" />
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </>
  );
}
