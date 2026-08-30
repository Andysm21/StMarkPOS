"use client";

import { useTranslations, useLocale } from "next-intl";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import type { AnalyticsData } from "./data";

const COLORS = ["#c2703d", "#d9b25a", "#5a8a72", "#a35c50", "#7a8ba6"];

export function AnalyticsClient({ data }: { data: AnalyticsData }) {
  const t = useTranslations("analytics");
  const locale = useLocale();

  const breakdown = data.salesBreakdown.map((d) => ({
    ...d,
    label: d.name === "tabs" ? t("tabs") : t("quickSales"),
  }));

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">{t("title")}</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">{t("openLiability")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">
              {formatCurrency(data.openLiability, locale)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">{t("salesBreakdown")}</CardTitle>
          </CardHeader>
          <CardContent className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={breakdown} dataKey="value" nameKey="label" outerRadius={60}>
                  {breakdown.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip formatter={(v) => formatCurrency(Number(v), locale)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {t("revenueOverTime")} ({t("last14Days")})
          </CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.dailyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => formatCurrency(Number(v), locale)} />
              <Legend />
              <Line type="monotone" dataKey="tabs" name={t("tabs")} stroke={COLORS[0]} strokeWidth={2} />
              <Line type="monotone" dataKey="quick" name={t("quickSales")} stroke={COLORS[1]} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              {t("topProducts")} — {t("byRevenue")}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topByRevenue} layout="vertical" margin={{ left: 40 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => formatCurrency(Number(v), locale)} />
                <Bar dataKey="value" fill={COLORS[0]} radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              {t("topProducts")} — {t("byQty")}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topByQty} layout="vertical" margin={{ left: 40 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill={COLORS[2]} radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
