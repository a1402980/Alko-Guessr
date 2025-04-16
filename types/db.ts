import getProductsParamsSchema from "@/schemas/db";
import { z } from "zod";

export type GetProductsParams = z.infer<typeof getProductsParamsSchema>;
