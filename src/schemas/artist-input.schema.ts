import z from "zod";

export const artistInputSchema = z.object({
  artistId: z.string().min(1, "El artistId es requerido"),
  arl: z.string().min(1, "El arl es requerido"),
});

export function validateArtist(body: unknown) {
  return artistInputSchema.safeParse(body);
}