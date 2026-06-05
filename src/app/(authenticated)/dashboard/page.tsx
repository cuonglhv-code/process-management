import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { DashboardContent } from "./DashboardContent";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
  });

  const isAdmin = profile?.role === "admin";

  const categories = await prisma.process.findMany({
    where: isAdmin
      ? {}
      : { OR: [{ published: true }, { ownerId: user.id }] },
    select: { category: true },
    distinct: ["category"],
  });

  const categoryList = categories
    .map((c) => c.category)
    .filter((c): c is string => c !== null);

  return (
    <DashboardContent
      userId={user.id}
      role={profile?.role ?? "staff"}
      categories={categoryList}
    />
  );
}
