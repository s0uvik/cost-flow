import { createFileRoute } from "@tanstack/react-router";
import { VendorDetailPage } from "@/pages/vendors/VendorDetailPage";

export const Route = createFileRoute("/_app/vendors/$id")({
  component: VendorDetailPage,
});
