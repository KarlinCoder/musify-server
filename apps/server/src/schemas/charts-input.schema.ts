import z from "zod";

export const chartsInputSchema = z.object({
  arl: z.string().min(1, "El arl es requerido"),
});

export function validateCharts(body: unknown) {
  return chartsInputSchema.safeParse(body);
}