import { getUsageStatus } from "@/lib/usage";
import { BackupClient } from "./backup-client";

export default async function BackupPage() {
  const usage = await getUsageStatus();
  return <BackupClient usage={usage} />;
}
