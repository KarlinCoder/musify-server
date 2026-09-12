import z from "zod";

export const albumInputSchema = z.object({
  albumId: z.string().min(1, "El albumId es requerido"),
  arl: z.string().min(1, "El arl es requerido"),
});

export function validateAlbum(body: unknown) {
  return albumInputSchema.safeParse(body);
}