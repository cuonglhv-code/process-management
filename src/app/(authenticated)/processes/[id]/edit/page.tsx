import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { ProcessEditClient } from "./ProcessEditClient";

export default async function ProcessEditPage({
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
      steps: {
        orderBy: { order: "asc" },
        include: {
          linkedForms: true,
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
  const isOwner = process.ownerId === user.id;

  if (!isAdmin && !isOwner) {
    notFound();
  }

  return <ProcessEditClient process={process as any} />;
}
