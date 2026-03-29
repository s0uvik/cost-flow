import { createFileRoute } from "@tanstack/react-router";
import { VendorListPage } from "@/pages/vendors/VendorListPage";

export const Route = createFileRoute("/_app/vendors/")({
  component: VendorListPage,
});
