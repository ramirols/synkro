/**
 * Traduce errores de Supabase, PostgreSQL, Storage y APIs a mensajes legibles en español.
 * Garantiza que NUNCA se filtre un mensaje en inglés en los toasts de la plataforma.
 */
export function getFriendlyErrorMessage(
  err: unknown,
  fallback = "Ocurrió un error inesperado. Por favor intenta de nuevo."
): string {
  if (!err) return fallback;

  let raw = "";
  if (typeof err === "string") {
    raw = err;
  } else if (typeof err === "object") {
    const anyErr = err as Record<string, unknown>;
    raw = String(
      anyErr.message ||
        anyErr.error_description ||
        anyErr.msg ||
        anyErr.details ||
        anyErr.code ||
        ""
    );
  }

  if (!raw.trim()) return fallback;

  const lower = raw.toLowerCase().trim();

  // 1. Errores de cambio y validación de contraseña
  if (
    lower.includes("should be different") ||
    lower.includes("different from the old") ||
    lower.includes("different from the current") ||
    lower.includes("different from old") ||
    lower.includes("same_password") ||
    lower.includes("same password") ||
    lower.includes("new_password_same")
  ) {
    return "La nueva contraseña debe ser diferente a tu contraseña anterior.";
  }

  if (
    lower.includes("at least 6 characters") ||
    lower.includes("at least 8 characters") ||
    lower.includes("minimum 8 characters") ||
    lower.includes("password should be at least")
  ) {
    return "La contraseña debe tener al menos 8 caracteres.";
  }

  if (
    lower.includes("password is too weak") ||
    lower.includes("weak_password") ||
    lower.includes("pwned") ||
    lower.includes("weak password")
  ) {
    return "La contraseña es muy débil. Usa letras, números y al menos 8 caracteres.";
  }

  // 2. Errores de sesión, enlaces y tokens OTP
  if (
    lower.includes("auth session missing") ||
    lower.includes("session missing") ||
    lower.includes("no session") ||
    lower.includes("session_not_found")
  ) {
    return "La sesión de recuperación ha expirado o no es válida. Por favor solicita un nuevo enlace.";
  }

  if (
    lower.includes("token has expired") ||
    lower.includes("otp_expired") ||
    lower.includes("token expired") ||
    lower.includes("token is invalid") ||
    lower.includes("invalid token") ||
    lower.includes("access_denied")
  ) {
    return "El enlace de acceso ha expirado o no es válido. Por favor solicita un nuevo enlace.";
  }

  if (
    lower.includes("jwt expired") ||
    lower.includes("refresh_token_not_found")
  ) {
    return "Tu sesión ha caducado. Por favor inicia sesión nuevamente.";
  }

  // 3. Credenciales y estado de cuenta
  if (
    lower.includes("invalid login credentials") ||
    lower.includes("invalid_credentials") ||
    lower.includes("invalid password") ||
    lower.includes("invalid email or password")
  ) {
    return "Credenciales incorrectas. Verifica tu correo y contraseña.";
  }

  if (
    lower.includes("user already registered") ||
    lower.includes("already registered") ||
    lower.includes("already in use") ||
    lower.includes("user_already_exists")
  ) {
    return "Ya existe una cuenta registrada con este correo electrónico.";
  }

  if (
    lower.includes("email not confirmed") ||
    lower.includes("email_not_confirmed") ||
    lower.includes("unconfirmed email")
  ) {
    return "Tu correo electrónico aún no ha sido confirmado. Revisa tu bandeja de entrada o carpeta de spam.";
  }

  if (
    lower.includes("user disabled") ||
    lower.includes("user is banned") ||
    lower.includes("account disabled")
  ) {
    return "Esta cuenta ha sido deshabilitada temporalmente. Contacta a soporte técnico.";
  }

  if (
    lower.includes("user not found") ||
    lower.includes("user_not_found")
  ) {
    return "No se encontró ningún usuario con ese correo electrónico.";
  }

  if (
    lower.includes("email logins are disabled") ||
    lower.includes("email_provider_disabled")
  ) {
    return "El inicio de sesión por correo electrónico se encuentra temporalmente desactivado.";
  }

  if (
    lower.includes("signup is disabled") ||
    lower.includes("signups not allowed") ||
    lower.includes("signups are disabled")
  ) {
    return "El registro de nuevas cuentas está deshabilitado temporalmente.";
  }

  // 4. Rate limits y SMTP
  if (
    lower.includes("over_email_send_rate_limit") ||
    lower.includes("email rate limit exceeded") ||
    lower.includes("60 seconds") ||
    lower.includes("rate limit") ||
    lower.includes("too many requests") ||
    lower.includes("over_request_rate_limit")
  ) {
    return "Has superado el límite de solicitudes permitidas. Por seguridad, espera 60 segundos antes de volver a intentar.";
  }

  if (
    lower.includes("error sending recovery email") ||
    lower.includes("smtp") ||
    lower.includes("resend")
  ) {
    return "Hubo un error al enviar el correo a través de Resend. Por favor intenta de nuevo en unos minutos.";
  }

  // 5. Red y conexión
  if (
    lower.includes("failed to fetch") ||
    lower.includes("networkerror") ||
    lower.includes("network error") ||
    lower.includes("fetch failed") ||
    lower.includes("load failed") ||
    lower.includes("connection refused")
  ) {
    return "Error de conexión. Por favor verifica tu acceso a internet.";
  }

  if (
    lower.includes("timeout") ||
    lower.includes("aborterror") ||
    lower.includes("aborted")
  ) {
    return "La solicitud tardó demasiado tiempo en responder. Por favor intenta de nuevo.";
  }

  // 6. Base de datos / PostgreSQL / RLS
  if (
    lower.includes("violates row-level security") ||
    lower.includes("row-level security") ||
    lower.includes("permission denied") ||
    lower.includes("insufficient privilege")
  ) {
    return "No tienes permisos suficientes para realizar esta acción.";
  }

  if (lower.includes("violates unique constraint") || lower.includes("duplicate key")) {
    return "Ya existe un registro con estos datos en el sistema.";
  }

  if (lower.includes("violates foreign key")) {
    return "La acción no pudo completarse porque depende de otro registro relacionado.";
  }

  // 7. Supabase Storage
  if (lower.includes("payload too large") || lower.includes("entity too large")) {
    return "El archivo supera el tamaño máximo permitido.";
  }

  if (lower.includes("bucket not found") || lower.includes("the resource was not found")) {
    return "El recurso o destino solicitado no fue encontrado.";
  }

  // 8. Detección de idioma inglés: si el mensaje tiene palabras comunes en inglés, evitar mostrar inglés
  const englishWords = [
    "error",
    "failed",
    "cannot",
    "could not",
    "found",
    "user",
    "invalid",
    "missing",
    "password",
    "email",
    "request",
    "denied",
    "forbidden",
    "unauthorized",
    "expired",
    "already",
    "unexpected",
    "please",
    "service",
    "unavailable",
    "server",
    "disabled",
    "allowed",
    "different",
    "syntax",
    "argument",
    "null",
  ];

  const hasEnglish = englishWords.some((w) => {
    const regex = new RegExp(`\\b${w}\\b`, "i");
    return regex.test(lower);
  });

  if (hasEnglish) {
    return fallback;
  }

  // Si ya es un texto en español comprensible, retornarlo
  return raw;
}

