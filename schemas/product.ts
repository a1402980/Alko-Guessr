import { z } from "zod";

export const productSchema = z.object({
  id: z.coerce.number(),
  product_id: z.string(),
  name: z.string(),
  manufacturer: z.string(),
  bottle_size: z.string(),
  price: z.coerce.number(),
  price_per_liter: z.coerce.number(),
  is_new: z.boolean(),
  price_order_code: z.string(),
  type: z.string(),
  sub_type: z.string(),
  special_group: z.string(),
  country: z.string(),
  region: z.string(),
  vintage: z.string(),
  label_notes: z.string(),
  notes: z.string(),
  grapes: z.string(),
  description: z.string(),
  packaging_type: z.string(),
  closure_type: z.string(),
  alcohol_percentage: z.coerce.number(),
  acidity: z.coerce.number(),
  sugar: z.coerce.number(),
  energy: z.coerce.number(),
  selection: z.string(),
  ean: z.string(),
  image_url: z.string(),
});

export const productsSchema = z.array(productSchema);
