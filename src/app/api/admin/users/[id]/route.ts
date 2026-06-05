import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

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

  const body = await request.json();
  const { role } = body;

  if (!["staff", "admin"].includes(role)) {
    return NextResponse.json(
      { error: "Invalid role", code: "BAD_REQUEST" },
      { status: 400 }
    );
  }

  await prisma.profile.update({
    where: { id },
    data: { role },
  });

  return NextResponse.json({ success: true });
}
