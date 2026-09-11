import z from "zod";

export const similarArtistsInputSchema = z.object({
  artistId: z.string().min(1, "El artistId es requerido"),
  arl: z.string().min(1, "El arl es requerido"),
  first: z.number().int().positive().optional(),
});

export function validateSimilarArtists(body: unknown) {
  return similarArtistsInputSchema.safeParse(body);
}