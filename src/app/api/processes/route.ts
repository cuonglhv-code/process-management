import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
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

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.toLowerCase();
  const category = searchParams.get("category");

  const isAdmin = profile?.role === "admin";

  const where: Record<string, unknown> = {};

  if (!isAdmin) {
    where.published = true;
  }

  if (category) {
    where.category = category;
  }

  let processes = await prisma.process.findMany({
    where: where as any,
    include: {
      owner: { select: { name: true } },
      _count: { select: { steps: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  if (q) {
    processes = processes.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.description?.toLowerCase() ?? "").includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        (p.category?.toLowerCase() ?? "").includes(q)
    );
  }

  const result = processes.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    category: p.category,
    ownerName: p.owner.name,
    stepCount: p._count.steps,
    updatedAt: p.updatedAt.toISOString(),
    published: p.published,
  }));

  return NextResponse.json(result);
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

  if (!profile || profile.role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden", code: "FORBIDDEN" },
      { status: 403 }
    );
  }

  const body = await request.json();

  const process = await prisma.process.create({
    data: {
      title: body.title,
      description: body.description ?? null,
      category: body.category ?? null,
      tags: body.tags ?? [],
      ownerId: user.id,
      published: body.published ?? false,
    },
  });

  return NextResponse.json(process, { status: 201 });
}
