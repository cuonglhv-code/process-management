import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function getSessionWithRole() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
  });

  if (!profile) return null;

  return {
    user,
    profile,
  };
}

export async function requireRole(...roles: Role[]) {
  const session = await getSessionWithRole();

  if (!session) {
    throw new AuthError("Unauthorized", "UNAUTHORIZED");
  }

  if (!roles.includes(session.profile.role)) {
    throw new AuthError("Forbidden", "FORBIDDEN");
  }

  return session;
}

export class AuthError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.code = code;
    this.name = "AuthError";
  }
}
