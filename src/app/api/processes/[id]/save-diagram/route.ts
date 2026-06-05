import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function POST(
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
  const { steps, edges } = body;

  await prisma.$transaction(async (tx) => {
    await tx.stepEdge.deleteMany({ where: { source: { processId: id } } });
    await tx.form.deleteMany({ where: { step: { processId: id } } });
    await tx.step.deleteMany({ where: { processId: id } });

    if (steps?.length) {
      await tx.step.createMany({
        data: steps.map((s: any) => ({
          processId: id,
          type: s.type,
          label: s.label,
          position: s.position,
          responsibleRole: s.responsibleRole ?? null,
          helpText: s.helpText ?? null,
          richNotes: s.richNotes ?? null,
          order: s.order ?? 0,
        })),
      });
    }

    const createdSteps = await tx.step.findMany({
      where: { processId: id },
      orderBy: { order: "asc" },
    });

    if (edges?.length && createdSteps.length > 0) {
      const stepMap = new Map<string, string>();
      steps.forEach((s: any, i: number) => {
        stepMap.set(s.tempId, createdSteps[i].id);
      });

      await tx.stepEdge.createMany({
        data: edges.map((e: any) => ({
          sourceId: stepMap.get(e.source) ?? e.source,
          targetId: stepMap.get(e.target) ?? e.target,
          label: e.label ?? null,
          style: e.style ?? "solid",
        })),
      });
    }
  });

  return NextResponse.json({ success: true });
}
