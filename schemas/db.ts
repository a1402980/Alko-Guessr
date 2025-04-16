import { z } from "zod";

const getProductsParamsSchema = z.object({
  category: z.string().optional(),
  categorySlug: z.string().optional(),
  priceMin: z.number().optional(),
  priceMax: z.number().optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
  bottleSize: z.string().optional(),
});

export default getProductsParamsSchema;
