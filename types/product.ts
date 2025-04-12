import { productSchema } from "@/schemas/product";
import { z } from "zod";

export type Product = z.infer<typeof productSchema>;
