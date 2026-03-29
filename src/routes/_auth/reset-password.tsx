import { createFileRoute } from "@tanstack/react-router";
import { ResetPasswordPage } from "@/pages/auth/ResetPasswordPage";

export const Route = createFileRoute("/_auth/reset-password")({
  component: ResetPasswordPage,
});
