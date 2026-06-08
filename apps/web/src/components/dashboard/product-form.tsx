"use client";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import type { ProductDetailDto, ProductUpsertInput } from "@riz/shared";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/lib/api-error";
import { cn } from "@/lib/utils";
import { useGetCategoriesQuery } from "@/store/api/catalogApi";
import { useCreateProductMutation, useUpdateProductMutation } from "@/store/api/productsApi";
import { CloudinaryImageField } from "./cloudinary-image-field";
import { RichTextEditor } from "./rich-text-editor";
import { TagInput } from "./tag-input";

const productFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  slug: z
    .string()
    .max(255)
    .regex(/^$|^[a-z0-9-]+$/, "Lowercase letters, numbers and hyphens only"),
  isActive: z.boolean(),
  imageUrl: z.string().nullable(),
  imageAlt: z.string().max(255),
  description: z.string().max(50000),
  inspiredBy: z.string().max(255),
  topNotes: z.array(z.string()),
  middleNotes: z.array(z.string()),
  baseNotes: z.array(z.string()),
  mainAccords: z.array(z.string()),
  metaTitle: z.string().max(255),
  metaDescription: z.string().max(5000),
  ogTitle: z.string().max(255),
  ogDescription: z.string().max(5000),
  ogImageUrl: z.string().nullable(),
  categoryIds: z.array(z.number()),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

const toDefaults = (product?: ProductDetailDto): ProductFormValues => ({
  name: product?.name ?? "",
  slug: product?.slug ?? "",
  isActive: product?.isActive ?? true,
  imageUrl: product?.imageUrl ?? null,
  imageAlt: product?.imageAlt ?? "",
  description: product?.description ?? "",
  inspiredBy: product?.fragrance.inspiredBy ?? "",
  topNotes: product?.fragrance.topNotes ?? [],
  middleNotes: product?.fragrance.middleNotes ?? [],
  baseNotes: product?.fragrance.baseNotes ?? [],
  mainAccords: product?.fragrance.mainAccords ?? [],
  metaTitle: product?.seo.metaTitle ?? "",
  metaDescription: product?.seo.metaDescription ?? "",
  ogTitle: product?.seo.ogTitle ?? "",
  ogDescription: product?.seo.ogDescription ?? "",
  ogImageUrl: product?.seo.ogImageUrl ?? null,
  categoryIds: product?.categories.map((category) => category.id) ?? [],
});

const orNull = (value: string) => (value.trim().length > 0 ? value.trim() : null);
const arrayOrNull = (value: string[]) => (value.length > 0 ? value : null);
// Rich-text description is HTML; treat markup-only-but-textless content as empty.
const stripHtml = (html: string) =>
  html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .trim();
const htmlOrNull = (html: string) => (stripHtml(html).length > 0 ? html : null);

const buildPayload = (values: ProductFormValues): ProductUpsertInput => ({
  name: values.name.trim(),
  slug: values.slug.trim() || undefined,
  isActive: values.isActive,
  imageUrl: values.imageUrl,
  imageAlt: orNull(values.imageAlt),
  description: htmlOrNull(values.description),
  inspiredBy: orNull(values.inspiredBy),
  topNotes: arrayOrNull(values.topNotes),
  middleNotes: arrayOrNull(values.middleNotes),
  baseNotes: arrayOrNull(values.baseNotes),
  mainAccords: arrayOrNull(values.mainAccords),
  metaTitle: orNull(values.metaTitle),
  metaDescription: orNull(values.metaDescription),
  ogTitle: orNull(values.ogTitle),
  ogDescription: htmlOrNull(values.ogDescription),
  ogImageUrl: values.ogImageUrl,
  categoryIds: values.categoryIds,
});

export function ProductForm({ product }: { product?: ProductDetailDto }) {
  const router = useRouter();
  const isEdit = Boolean(product);
  const { data: categories } = useGetCategoriesQuery({ includeInactive: true });
  const [createProduct, createState] = useCreateProductMutation();
  const [updateProduct, updateState] = useUpdateProductMutation();
  const submitting = createState.isLoading || updateState.isLoading;

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: toDefaults(product),
  });

  const onSubmit = async (values: ProductFormValues) => {
    const payload = buildPayload(values);
    try {
      if (isEdit && product) {
        await updateProduct({ id: product.id, body: payload }).unwrap();
        toast.success("Product updated");
      } else {
        const created = await createProduct(payload).unwrap();
        toast.success("Product created");
        router.push(`/dashboard/products/${created.id}/edit`);
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not save product"));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Oud Royale" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="auto-generated from name if left blank" {...field} />
                  </FormControl>
                  <FormDescription>Used in the public URL: /products/&lt;slug&gt;</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Main image</FormLabel>
                  <FormControl>
                    <CloudinaryImageField value={field.value} onChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageAlt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image alt text</FormLabel>
                  <FormControl>
                    <Input placeholder="Oud Royale bottle" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Describe the fragrance…"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <FormLabel>Active</FormLabel>
                    <FormDescription>Visible on the public storefront.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Fragrance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fragrance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="inspiredBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Inspired by</FormLabel>
                  <FormControl>
                    <Input placeholder="Traditional Middle Eastern Oud" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            {(
              [
                ["topNotes", "Top notes"],
                ["middleNotes", "Middle notes"],
                ["baseNotes", "Base notes"],
                ["mainAccords", "Main accords"],
              ] as const
            ).map(([name, label]) => (
              <FormField
                key={name}
                control={form.control}
                name={name}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                      <TagInput value={field.value} onChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            ))}
          </CardContent>
        </Card>

        {/* Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="categoryIds"
              render={({ field }) => (
                <FormItem>
                  {categories && categories.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => {
                        const selected = field.value.includes(category.id);
                        return (
                          <button
                            type="button"
                            key={category.id}
                            onClick={() =>
                              field.onChange(
                                selected
                                  ? field.value.filter((id) => id !== category.id)
                                  : [...field.value, category.id],
                              )
                            }
                            className={cn(
                              "rounded-full border px-3 py-1 text-sm transition-colors",
                              selected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "hover:bg-accent",
                            )}
                          >
                            {category.name}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No categories yet — create some under Categories first.
                    </p>
                  )}
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* SEO */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">SEO &amp; Social</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="metaTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="metaDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta description</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ogTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OG title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ogDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OG description</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Social share description…"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ogImageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OG image</FormLabel>
                  <FormControl>
                    <CloudinaryImageField value={field.value} onChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/products")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isEdit ? "Save changes" : "Create product"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
