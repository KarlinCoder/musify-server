import z from "zod";

export const artistMixInputSchema = z.object({
  artistId: z.string().min(1, "El artistId es requerido"),
  arl: z.string().min(1, "El arl es requerido"),
  limit: z.number().int().positive().optional(),
});

export function validateArtistMix(body: unknown) {
  return artistMixInputSchema.safeParse(body);
}