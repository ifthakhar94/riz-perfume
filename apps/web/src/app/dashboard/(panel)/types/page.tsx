"use client";

import { LookupManager } from "@/components/dashboard/lookup-manager";
import {
  useCreateTypeMutation,
  useDeleteTypeMutation,
  useGetTypesQuery,
  useUpdateTypeMutation,
} from "@/store/api/catalogApi";

export default function TypesPage() {
  const { data, isLoading } = useGetTypesQuery();
  const [create, createState] = useCreateTypeMutation();
  const [update, updateState] = useUpdateTypeMutation();
  const [remove, removeState] = useDeleteTypeMutation();

  return (
    <LookupManager
      title="Types"
      description="Product types used by variants (e.g. Spray, Oil, Eau de Parfum)."
      singular="Type"
      items={data}
      isLoading={isLoading}
      busy={createState.isLoading || updateState.isLoading || removeState.isLoading}
      onCreate={(values) => create({ name: values.name }).unwrap()}
      onUpdate={(id, values) => update({ id, body: { name: values.name } }).unwrap()}
      onDelete={(id) => remove(id).unwrap()}
    />
  );
}
