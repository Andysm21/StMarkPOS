import { getSettings } from "./actions";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const settings = await getSettings();
  return <SettingsClient initial={settings} />;
}
