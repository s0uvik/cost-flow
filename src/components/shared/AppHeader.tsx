import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useRouterState } from "@tanstack/react-router";

const routeTitles: Record<string, string> = {
  "/": "Dashboard",
  "/transactions": "Transactions",
  "/transactions/new": "New Transaction",
  "/categories": "Categories",
  "/budgets": "Budgets",
  "/invoices": "Invoices",
  "/invoices/new": "New Invoice",
  "/reports": "Reports",
  "/clients": "Clients",
  "/vendors": "Vendors",
  "/settings": "Settings",
};

export function AppHeader() {
  const location = useRouterState({ select: (s) => s.location });
  const pathname = location.pathname;
  const title = routeTitles[pathname] ?? "Cost Flow";

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-3 sm:px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <h1 className="truncate text-sm font-semibold">{title}</h1>
    </header>
  );
}
