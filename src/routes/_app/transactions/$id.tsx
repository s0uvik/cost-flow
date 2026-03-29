import { createFileRoute } from "@tanstack/react-router";
import { TransactionFormPage } from "@/pages/transactions/TransactionFormPage";

export const Route = createFileRoute("/_app/transactions/$id")({
  component: TransactionFormPage,
});
