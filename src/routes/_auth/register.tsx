import { createFileRoute } from "@tanstack/react-router";
// import { RegisterPage } from "@/pages/auth/RegisterPage";
import { RequestAccessPage } from "@/pages/auth/RequestAccessPage";

export const Route = createFileRoute("/_auth/register")({
  component: RequestAccessPage,
});
