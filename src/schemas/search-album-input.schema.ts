import z from "zod";

export const searchAlbumInputSchema = z.object({
  q: z.string().min(1, "El parámetro q es requerido"),
  arl: z.string().min(1, "El arl es requerido"),
  first: z.number().int().positive().optional(),
});

export function validateSearchAlbum(body: unknown) {
  return searchAlbumInputSchema.safeParse(body);
}