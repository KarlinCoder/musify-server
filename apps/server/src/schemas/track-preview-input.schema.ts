import z from "zod";

export const trackPreviewInputSchema = z.object({
  trackId: z.string().min(1, "El trackId es requerido"),
  arl: z.string().min(1, "El arl es requerido"),
});

export function validateTrackPreview(body: unknown) {
  return trackPreviewInputSchema.safeParse(body);
}