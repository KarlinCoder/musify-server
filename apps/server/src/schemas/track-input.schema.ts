import z from "zod";

export const trackInputSchema = z.object({
  trackId: z.string().min(1, "El trackId es requerido"),
  arl: z.string().min(1, "El arl es requerido"),
});

export function validateTrack(body: unknown) {
  return trackInputSchema.safeParse(body);
}