import z from "zod";

export const playlistInputSchema = z.object({
  playlistId: z.string().min(1, "El playlistId es requerido"),
  arl: z.string().min(1, "El arl es requerido"),
});

export function validatePlaylist(body: unknown) {
  return playlistInputSchema.safeParse(body);
}