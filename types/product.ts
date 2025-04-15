import {
  formattedTypeSchema,
  integrationProductSchema,
  productSchema,
} from "@/schemas/product";
import { z } from "zod";

export type Product = z.infer<typeof productSchema>;

export type IntegrationProduct = z.infer<typeof integrationProductSchema>;

export type FormattedType = z.infer<typeof formattedTypeSchema>;
