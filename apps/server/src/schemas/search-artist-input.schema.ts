import z from "zod";

export const searchArtistInputSchema = z.object({
  q: z.string().min(1, "El parámetro q es requerido"),
  arl: z.string().min(1, "El arl es requerido"),
  first: z.number().int().positive().optional(),
});

export function validateSearchArtist(body: unknown) {
  return searchArtistInputSchema.safeParse(body);
}