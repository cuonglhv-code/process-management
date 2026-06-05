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

  const step = await prisma.step.findUnique({
    where: { id },
    include: { process: { select: { ownerId: true } } },
  });

  if (!step) {
    return NextResponse.json(
      { error: "Step not found", code: "NOT_FOUND" },
      { status: 404 }
    );
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
  });

  const isAdmin = profile?.role === "admin";

  if (!isAdmin) {
    return NextResponse.json(
      { error: "Forbidden", code: "FORBIDDEN" },
      { status: 403 }
    );
  }

  const body = await request.json();

  const updated = await prisma.step.update({
    where: { id },
    data: {
      ...(body.label !== undefined && { label: body.label }),
      ...(body.type !== undefined && { type: body.type }),
      ...(body.position !== undefined && { position: body.position }),
      ...(body.responsibleRole !== undefined && {
        responsibleRole: body.responsibleRole,
      }),
      ...(body.helpText !== undefined && { helpText: body.helpText }),
      ...(body.richNotes !== undefined && { richNotes: body.richNotes }),
      ...(body.order !== undefined && { order: body.order }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
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

  const step = await prisma.step.findUnique({
    where: { id },
    include: { process: { select: { ownerId: true } } },
  });

  if (!step) {
    return NextResponse.json(
      { error: "Step not found", code: "NOT_FOUND" },
      { status: 404 }
    );
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
  });

  const isAdmin = profile?.role === "admin";

  if (!isAdmin) {
    return NextResponse.json(
      { error: "Forbidden", code: "FORBIDDEN" },
      { status: 403 }
    );
  }

  await prisma.step.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
