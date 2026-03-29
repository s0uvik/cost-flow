import { Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Tag,
  PiggyBank,
  FileText,
  BarChart2,
  Users,
  Building2,
  Settings,
  TrendingUp,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfile } from "@/pages/settings/hooks/useProfile";
import { UserMenu } from "./UserMenu";

const navItems = [
  { title: "Dashboard", to: "/", icon: LayoutDashboard },
  { title: "Transactions", to: "/transactions", icon: ArrowLeftRight },
  { title: "Categories", to: "/categories", icon: Tag },
  { title: "Budgets", to: "/budgets", icon: PiggyBank },
];

const businessItems = [
  { title: "Invoices", to: "/invoices", icon: FileText },
  { title: "Clients", to: "/clients", icon: Users },
  { title: "Vendors", to: "/vendors", icon: Building2 },
];

const reportItems = [{ title: "Reports", to: "/reports", icon: BarChart2 }];

export function AppSidebar() {
  const { data: profile } = useProfile();
  const { setOpenMobile } = useSidebar();

  const logoUrl = profile?.logo_url ?? undefined;
  const businessName = profile?.business_name || "";
  const initials = businessName.slice(0, 2).toUpperCase() || "ET";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/">
                <Avatar className="size-8 shrink-0 rounded-lg">
                  <AvatarImage
                    src={logoUrl}
                    alt={businessName}
                    className="object-contain p-0.5"
                  />
                  <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                    {businessName ? (
                      initials
                    ) : (
                      <TrendingUp className="size-4" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-col gap-0.5 leading-none">
                  <span className="truncate font-semibold">
                    {businessName || "Cost Flow"}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    Business Finance
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      to={item.to}
                      activeProps={{
                        className:
                          "bg-sidebar-accent text-sidebar-accent-foreground",
                      }}
                      onClick={() => setOpenMobile(false)}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Business</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {businessItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      to={item.to}
                      activeProps={{
                        className:
                          "bg-sidebar-accent text-sidebar-accent-foreground",
                      }}
                      onClick={() => setOpenMobile(false)}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Analytics</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {reportItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      to={item.to}
                      activeProps={{
                        className:
                          "bg-sidebar-accent text-sidebar-accent-foreground",
                      }}
                      onClick={() => setOpenMobile(false)}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link
                to="/settings"
                activeProps={{
                  className: "bg-sidebar-accent text-sidebar-accent-foreground",
                }}
                onClick={() => setOpenMobile(false)}
              >
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <UserMenu />
      </SidebarFooter>
    </Sidebar>
  );
}
