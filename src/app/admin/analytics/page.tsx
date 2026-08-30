import { getAnalytics } from "./data";
import { AnalyticsClient } from "./analytics-client";

export default async function AnalyticsPage() {
  const data = await getAnalytics();
  return <AnalyticsClient data={data} />;
}
