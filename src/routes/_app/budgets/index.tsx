import { createFileRoute } from "@tanstack/react-router";
import { BudgetsPage } from "@/pages/budgets/BudgetsPage";

export const Route = createFileRoute("/_app/budgets/")({
  component: BudgetsPage,
});
