"use client";

import { useState } from "react";

import { LookupManager } from "@/components/dashboard/lookup-manager";
import { ExpensesManager } from "@/components/dashboard/finance/expenses-manager";
import { FinanceOverview } from "@/components/dashboard/finance/finance-overview";
import { InvestmentsManager } from "@/components/dashboard/finance/investments-manager";
import { PageHeader } from "@/components/dashboard/page-header";
import { cn } from "@/lib/utils";
import {
  useCreateExpenseCategoryMutation,
  useDeleteExpenseCategoryMutation,
  useGetExpenseCategoriesQuery,
  useUpdateExpenseCategoryMutation,
} from "@/store/api/financeApi";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "expenses", label: "Expenses" },
  { key: "investments", label: "Investments" },
  { key: "categories", label: "Categories" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function ExpenseCategoriesTab() {
  const { data, isLoading } = useGetExpenseCategoriesQuery({ includeInactive: true });
  const [create, createState] = useCreateExpenseCategoryMutation();
  const [update, updateState] = useUpdateExpenseCategoryMutation();
  const [remove, removeState] = useDeleteExpenseCategoryMutation();

  return (
    <LookupManager
      title="Expense Categories"
      description="Group expenses for reporting (e.g. Raw Materials, Packaging, Marketing)."
      singular="Category"
      withActiveToggle
      items={data}
      isLoading={isLoading}
      busy={createState.isLoading || updateState.isLoading || removeState.isLoading}
      onCreate={(values) => create({ name: values.name, isActive: values.isActive }).unwrap()}
      onUpdate={(id, values) => update({ id, body: values }).unwrap()}
      onDelete={(id) => remove(id).unwrap()}
    />
  );
}

export default function FinancePage() {
  const [tab, setTab] = useState<TabKey>("overview");

  return (
    <div>
      <PageHeader title="Finance" description="Expenses, investments and cost analytics." />

      <div className="mb-6 inline-flex flex-wrap gap-1 rounded-md bg-muted p-1">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={cn(
              "rounded px-3 py-1.5 text-sm font-medium transition-colors",
              tab === item.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "overview" ? <FinanceOverview /> : null}
      {tab === "expenses" ? <ExpensesManager /> : null}
      {tab === "investments" ? <InvestmentsManager /> : null}
      {tab === "categories" ? <ExpenseCategoriesTab /> : null}
    </div>
  );
}
