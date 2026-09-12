import z from "zod";

export const searchTrackInputSchema = z.object({
  q: z.string().min(1, "El parámetro q es requerido"),
  arl: z.string().min(1, "El arl es requerido"),
  first: z.number().int().positive().optional(),
});

export function validateSearchTrack(body: unknown) {
  return searchTrackInputSchema.safeParse(body);
}