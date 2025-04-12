import { z } from "zod";

export const scoreSchema = z.object({
  id: z.number(),
  name: z.string(),
  score: z.number(),
  category: z.string().optional().nullable(),
  created: z.date().optional(),
});

export const scoresSchema = z.array(scoreSchema);
