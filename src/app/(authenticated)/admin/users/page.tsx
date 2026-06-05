import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { AdminUsersClient } from "./AdminUsersClient";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
  });

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  const users = await prisma.profile.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <AdminUsersClient users={users as any} />;
}
