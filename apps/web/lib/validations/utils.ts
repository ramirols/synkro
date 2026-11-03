import { z } from "zod";

/**
 * Convierte un ZodError en un mapa de errores por campo: { [campo]: "Primer mensaje de error" }
 */
export function formatZodErrors<T = Record<string, string>>(
  error: z.ZodError
): Record<string, string> {
  const formatted: Record<string, string> = {};

  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    // Preservar el primer error por cada campo
    if (!formatted[key]) {
      formatted[key] = issue.message;
    }
  }

  return formatted;
}

/**
 * Validador síncrono para formularios con retorno tipado
 */
export function validateForm<T>(
  schema: z.ZodType<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string>; firstError: string } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors = formatZodErrors(result.error);
  const firstError = result.error.issues[0]?.message || "Por favor verifica los campos con error.";

  return { success: false, errors, firstError };
}

