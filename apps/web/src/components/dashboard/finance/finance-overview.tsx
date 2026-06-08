"use client";

import type { ApexOptions } from "apexcharts";
import { Banknote, Receipt, Scale, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Chart } from "@/components/dashboard/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBDT, formatTaka } from "@/lib/format";
import { useGetExpensesQuery, useGetInvestmentsQuery } from "@/store/api/financeApi";

const PALETTE = [
  "#C41B35",
  "#E8714F",
  "#F2B705",
  "#3A7CA5",
  "#5B8C5A",
  "#8E5572",
  "#2F4858",
  "#D17B88",
];

function StatCard({
  label,
  value,
  icon: Icon,
  loading,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className="h-5 w-5 text-primary" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-7 w-28" />
        ) : (
          <div className="font-serif text-2xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  );
}

function sumByKey<T>(items: T[], keyOf: (item: T) => string, valueOf: (item: T) => number) {
  const map = new Map<string, number>();
  for (const item of items) {
    const key = keyOf(item);
    map.set(key, (map.get(key) ?? 0) + valueOf(item));
  }
  return map;
}

const donutOptions = (labels: string[]): ApexOptions => ({
  chart: { fontFamily: "inherit" },
  labels,
  colors: PALETTE,
  legend: { position: "bottom" },
  dataLabels: { enabled: true, formatter: (value: number) => `${value.toFixed(0)}%` },
  stroke: { width: 0 },
  tooltip: { y: { formatter: (value: number) => formatBDT(value) } },
});

export function FinanceOverview() {
  // For an overview we read a generous page; a backend summary endpoint can replace this later.
  const expensesQuery = useGetExpensesQuery({ page: 1, pageSize: 100 });
  const investmentsQuery = useGetInvestmentsQuery({ page: 1, pageSize: 100 });
  const loading = expensesQuery.isLoading || investmentsQuery.isLoading;

  const expenses = expensesQuery.data?.items ?? [];
  const investments = investmentsQuery.data?.items ?? [];

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalInvestments = investments.reduce((sum, investment) => sum + investment.amount, 0);
  const net = totalInvestments - totalExpenses;

  const monthly = sumByKey(
    expenses,
    (expense) => expense.expenseDate.slice(0, 7),
    (expense) => expense.amount,
  );
  const months = [...monthly.keys()].sort();
  const monthlySeries = [
    { name: "Expenses", data: months.map((month) => monthly.get(month) ?? 0) },
  ];
  const monthlyOptions: ApexOptions = {
    chart: { toolbar: { show: false }, fontFamily: "inherit" },
    colors: ["#C41B35"],
    plotOptions: { bar: { borderRadius: 4, columnWidth: "50%" } },
    dataLabels: { enabled: false },
    xaxis: { categories: months },
    yaxis: { labels: { formatter: (value) => formatTaka(value) } },
    grid: { borderColor: "#eee", strokeDashArray: 4 },
    tooltip: { y: { formatter: (value) => formatBDT(value) } },
  };

  const byCategory = sumByKey(
    expenses,
    (expense) => expense.category?.name ?? "Uncategorized",
    (expense) => expense.amount,
  );
  const categoryLabels = [...byCategory.keys()];
  const categorySeries = categoryLabels.map((label) => byCategory.get(label) ?? 0);

  const byInvestor = sumByKey(
    investments,
    (investment) => investment.investorName,
    (investment) => investment.amount,
  );
  const investorLabels = [...byInvestor.keys()];
  const investorSeries = investorLabels.map((label) => byInvestor.get(label) ?? 0);

  const emptyHint = <p className="py-16 text-center text-sm text-muted-foreground">No data yet.</p>;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Investments"
          value={formatBDT(totalInvestments)}
          icon={Banknote}
          loading={loading}
        />
        <StatCard
          label="Total Expenses"
          value={formatBDT(totalExpenses)}
          icon={Receipt}
          loading={loading}
        />
        <StatCard label="Net Balance" value={formatBDT(net)} icon={Scale} loading={loading} />
        <StatCard
          label="Expense Entries"
          value={String(expenses.length)}
          icon={Wallet}
          loading={loading}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Expenses by month</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-72 w-full" />
          ) : months.length === 0 ? (
            emptyHint
          ) : (
            <Chart type="bar" series={monthlySeries} options={monthlyOptions} height={300} />
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Expenses by category</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-72 w-full" />
            ) : categoryLabels.length === 0 ? (
              emptyHint
            ) : (
              <Chart
                type="donut"
                series={categorySeries}
                options={donutOptions(categoryLabels)}
                height={320}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Investments by investor</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-72 w-full" />
            ) : investorLabels.length === 0 ? (
              emptyHint
            ) : (
              <Chart
                type="donut"
                series={investorSeries}
                options={donutOptions(investorLabels)}
                height={320}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
