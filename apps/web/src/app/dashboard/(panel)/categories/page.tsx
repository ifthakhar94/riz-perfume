"use client";

import { LookupManager } from "@/components/dashboard/lookup-manager";
import {
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCategoriesQuery,
  useUpdateCategoryMutation,
} from "@/store/api/catalogApi";

export default function CategoriesPage() {
  const { data, isLoading } = useGetCategoriesQuery({ includeInactive: true });
  const [create, createState] = useCreateCategoryMutation();
  const [update, updateState] = useUpdateCategoryMutation();
  const [remove, removeState] = useDeleteCategoryMutation();

  return (
    <LookupManager
      title="Categories"
      description="Group products for browsing (e.g. Oil Perfume, Spray Perfume, Combo)."
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
