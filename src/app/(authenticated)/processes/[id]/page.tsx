import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { ProcessViewClient } from "./ProcessViewClient";

export default async function ProcessViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

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
    notFound();
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
  });

  const isAdmin = profile?.role === "admin";

  if (!process.published && !isAdmin) {
    notFound();
  }

  const canEdit = isAdmin;

  return <ProcessViewClient process={process as any} canEdit={canEdit} />;
}
