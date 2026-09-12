import z from "zod";

export const trackMixInputSchema = z.object({
  trackId: z.string().min(1, "El trackId es requerido"),
  arl: z.string().min(1, "El arl es requerido"),
  limit: z.number().int().positive().optional(),
  startWithInputTrack: z.boolean().optional(),
});

export function validateTrackMix(body: unknown) {
  return trackMixInputSchema.safeParse(body);
}