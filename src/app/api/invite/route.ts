import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const rateLimit = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimit.set(key, { count: 1, resetAt: now + 3600000 });
    return true;
  }

  if (entry.count >= 10) return false;

  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
  });

  if (profile?.role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden", code: "FORBIDDEN" },
      { status: 403 }
    );
  }

  if (!checkRateLimit(user.id)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Max 10 invites per hour.", code: "RATE_LIMITED" },
      { status: 429 }
    );
  }

  const { email } = await request.json();

  if (!email || typeof email !== "string") {
    return NextResponse.json(
      { error: "Email is required", code: "BAD_REQUEST" },
      { status: 400 }
    );
  }

  const existing = await prisma.profile.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "User already exists", code: "CONFLICT" },
      { status: 409 }
    );
  }

  const serviceClient = await createServiceClient();
  const { error } = await serviceClient.auth.admin.inviteUserByEmail(email);

  if (error) {
    return NextResponse.json(
      { error: error.message, code: "INVITE_FAILED" },
      { status: 500 }
    );
  }

  await prisma.profile.create({
    data: { id: crypto.randomUUID(), email, role: "staff" },
  });

  return NextResponse.json({ success: true });
}
