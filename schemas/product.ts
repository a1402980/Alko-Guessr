import { z } from "zod";

export const productSchema = z.object({
  id: z.coerce.number(),
  product_id: z.string(),
  name: z.string(),
  manufacturer: z.string().nullable(),
  bottle_size: z.string().nullable(),
  price: z.coerce.number(),
  price_per_liter: z.coerce.number().nullable(),
  is_new: z.boolean(),
  price_order_code: z.string().nullable(),
  type: z.string().nullable(),
  sub_type: z.string().nullable(),
  special_group: z.string().nullable(),
  country: z.string().nullable(),
  region: z.string().nullable(),
  vintage: z.string().nullable(),
  label_notes: z.string().nullable(),
  notes: z.string().nullable(),
  grapes: z.string().nullable(),
  description: z.string().nullable(),
  packaging_type: z.string().nullable(),
  closure_type: z.string().nullable(),
  alcohol_percentage: z.coerce.number().nullable(),
  acidity: z.coerce.number().nullable(),
  sugar: z.coerce.number().nullable(),
  energy: z.coerce.number().nullable(),
  selection: z.string().nullable(),
  ean: z.string().nullable(),
  image_url: z.string().nullable(),
});

export const productsSchema = z.array(productSchema);

export const integrationProductSchema = productSchema.omit({
  id: true,
});

export const formattedTypeSchema = z.object({
  name: z.string(),
  name_en: z.string(),
  slug: z.string(),
});

export const formattedTypesSchema = z.array(formattedTypeSchema);
