/**
 * Cloudflare Turnstile verification helper.
 *
 * Verifies a client token against Cloudflare's siteverify endpoint.
 * If TURNSTILE_SECRET_KEY is not set, returns { skip: true } so the app
 * still works during development or before keys are configured.
 */

export type TurnstileResult = {
  ok: boolean;
  skip?: boolean;
  errorCodes?: string[];
  message?: string;
};

export async function verifyTurnstile(
  token: string | null | undefined,
  remoteIp?: string
): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  // No secret configured → skip (useful in dev)
  if (!secret) {
    return { ok: true, skip: true };
  }

  if (!token) {
    return { ok: false, message: "Verificação humana ausente" };
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secret);
    formData.append("response", token);
    if (remoteIp) formData.append("remoteip", remoteIp);

    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      }
    );

    if (!res.ok) {
      return { ok: false, message: "Falha ao validar verificação humana" };
    }

    const json = (await res.json()) as {
      success: boolean;
      "error-codes"?: string[];
    };

    if (!json.success) {
      return {
        ok: false,
        errorCodes: json["error-codes"],
        message: "Verificação humana falhou. Tente novamente.",
      };
    }

    return { ok: true };
  } catch {
    return { ok: false, message: "Erro ao conectar com serviço de verificação" };
  }
}

export const TURNSTILE_ENABLED = Boolean(process.env.TURNSTILE_SECRET_KEY);
