import { useQueryState, parseAsStringEnum } from "nuqs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/PageHeader";
import { ProfileForm } from "./components/ProfileForm";
import { TaxCurrencyForm } from "./components/TaxCurrencyForm";
import { ChangePasswordForm } from "./components/ChangePasswordForm";

const TABS = ["profile", "tax", "security"] as const;
type Tab = (typeof TABS)[number];

export function SettingsPage() {
  const [tab, setTab] = useQueryState(
    "tab",
    parseAsStringEnum<Tab>([...TABS]).withDefault("profile")
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your business profile and account preferences"
      />

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as Tab)}
        className="space-y-6"
      >
        <TabsList>
          <TabsTrigger value="profile">Business Profile</TabsTrigger>
          <TabsTrigger value="tax">Tax & Currency</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-0">
          <ProfileForm />
        </TabsContent>

        <TabsContent value="tax" className="space-y-0">
          <TaxCurrencyForm />
        </TabsContent>

        <TabsContent value="security" className="space-y-0">
          <ChangePasswordForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
