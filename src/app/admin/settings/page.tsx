import { hasValidSuperAdminSession } from "@/lib/session";
import { SuperAdminGate } from "@/components/admin/super-admin-gate";
import { getSettings } from "./actions";
import { countOpenTabs } from "@/app/actions/tabs";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const isSuperAdmin = await hasValidSuperAdminSession();
  if (!isSuperAdmin) {
    return <SuperAdminGate />;
  }
  const [settings, openTabCount] = await Promise.all([getSettings(), countOpenTabs()]);
  return <SettingsClient initial={settings} openTabCount={openTabCount} />;
}
