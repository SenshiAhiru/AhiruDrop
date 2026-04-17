import { NextResponse } from "next/server";
import { auth } from "./auth";
import { ZodSchema } from "zod";
import { ADMIN_ROLES, type Role } from "@/constants/roles";

export function successResponse(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function validateBody<T>(request: Request, schema: ZodSchema<T>) {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      return { data: null, error: result.error.issues[0]?.message ?? "Dados inválidos" };
    }
    return { data: result.data, error: null };
  } catch {
    return { data: null, error: "Invalid JSON body" };
  }
}

export async function getSession() {
  return await auth();
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new AuthError("Unauthorized");
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  if (!ADMIN_ROLES.includes(session.user.role as Role)) {
    throw new AuthError("Forbidden");
  }
  return session;
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof AuthError) {
    const status = error.message === "Forbidden" ? 403 : 401;
    return errorResponse(error.message, status);
  }
  console.error("API Error:", error);
  return errorResponse("Internal server error", 500);
}
