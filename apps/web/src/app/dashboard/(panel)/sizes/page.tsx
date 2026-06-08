"use client";

import { LookupManager } from "@/components/dashboard/lookup-manager";
import {
  useCreateSizeMutation,
  useDeleteSizeMutation,
  useGetSizesQuery,
  useUpdateSizeMutation,
} from "@/store/api/catalogApi";

export default function SizesPage() {
  const { data, isLoading } = useGetSizesQuery();
  const [create, createState] = useCreateSizeMutation();
  const [update, updateState] = useUpdateSizeMutation();
  const [remove, removeState] = useDeleteSizeMutation();

  return (
    <LookupManager
      title="Sizes"
      description="Bottle sizes used by product variants (e.g. 15ml, 30ml, 50ml)."
      singular="Size"
      items={data}
      isLoading={isLoading}
      busy={createState.isLoading || updateState.isLoading || removeState.isLoading}
      onCreate={(values) => create({ name: values.name }).unwrap()}
      onUpdate={(id, values) => update({ id, body: { name: values.name } }).unwrap()}
      onDelete={(id) => remove(id).unwrap()}
    />
  );
}
