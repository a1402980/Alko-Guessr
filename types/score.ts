import { scoreSchema } from "@/schemas/scrore";
import { z } from "zod";

export type Score = z.infer<typeof scoreSchema>;
