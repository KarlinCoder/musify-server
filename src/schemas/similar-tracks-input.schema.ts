import z from "zod";

export const similarTracksInputSchema = z.object({
  trackId: z.string().min(1, "El trackId es requerido"),
  arl: z.string().min(1, "El arl es requerido"),
  nb: z.number().int().positive().optional(),
});

export function validateSimilarTracks(body: unknown) {
  return similarTracksInputSchema.safeParse(body);
}