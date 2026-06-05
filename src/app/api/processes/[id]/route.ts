import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET(
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

  const process = await prisma.process.findUnique({
    where: { id },
    include: {
      owner: { select: { name: true, email: true } },
      steps: {
        orderBy: { order: "asc" },
        include: {
          linkedForms: true,
          incomingEdges: true,
          outgoingEdges: true,
        },
      },
    },
  });

  if (!process) {
    return NextResponse.json(
      { error: "Process not found", code: "NOT_FOUND" },
      { status: 404 }
    );
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
  });

  const isOwnerOrAdmin =
    profile?.role === "admin" || process.ownerId === user.id;

  if (!process.published && !isOwnerOrAdmin) {
    return NextResponse.json(
      { error: "Process not found", code: "NOT_FOUND" },
      { status: 404 }
    );
  }

  return NextResponse.json(process);
}

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

  const process = await prisma.process.findUnique({
    where: { id },
    select: { ownerId: true },
  });

  if (!process) {
    return NextResponse.json(
      { error: "Process not found", code: "NOT_FOUND" },
      { status: 404 }
    );
  }

  const isAdmin = profile?.role === "admin";
  const isOwner = process.ownerId === user.id;

  if (!isAdmin && !isOwner) {
    return NextResponse.json(
      { error: "Forbidden", code: "FORBIDDEN" },
      { status: 403 }
    );
  }

  const body = await request.json();

  const updated = await prisma.process.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.category !== undefined && { category: body.category }),
      ...(body.tags !== undefined && { tags: body.tags }),
      ...(body.published !== undefined && { published: body.published }),
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

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
  });

  if (profile?.role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden", code: "FORBIDDEN" },
      { status: 403 }
    );
  }

  await prisma.process.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
