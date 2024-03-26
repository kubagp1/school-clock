import { z } from "zod";

export const baseNewsTickerSchema = z.object({
  text: z.string().min(1),
  loop: z.number().int().min(0),
  speed: z.number(),
  forceHiddenFalse: z.boolean(),
  startAt: z.date(),
  endAt: z.date(),
});

export type BaseNewsTicker = z.infer<typeof baseNewsTickerSchema>;

export const newNewsTickerSchema = baseNewsTickerSchema.extend({
  configurationId: z.string().min(1),
});

export const newsTickerSchema = newNewsTickerSchema.extend({
  id: z.string().min(1),
});
