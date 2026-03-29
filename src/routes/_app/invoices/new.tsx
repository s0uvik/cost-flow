import { createFileRoute } from "@tanstack/react-router";
import { InvoiceFormPage } from "@/pages/invoices/InvoiceFormPage";

export const Route = createFileRoute("/_app/invoices/new")({
  component: InvoiceFormPage,
});
