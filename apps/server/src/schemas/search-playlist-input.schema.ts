import z from "zod";

export const searchPlaylistInputSchema = z.object({
  q: z.string().min(1, "El parámetro q es requerido"),
  arl: z.string().min(1, "El arl es requerido"),
  first: z.number().int().positive().optional(),
});

export function validateSearchPlaylist(body: unknown) {
  return searchPlaylistInputSchema.safeParse(body);
}