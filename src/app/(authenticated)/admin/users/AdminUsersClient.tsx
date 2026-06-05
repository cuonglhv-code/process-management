"use client";

import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: Date;
}

const roleColors: Record<string, string> = {
  admin: "bg-brand-purple text-white",
  staff: "bg-muted text-muted-foreground",
};

interface AdminUsersClientProps {
  users: UserProfile[];
}

export function AdminUsersClient({ users }: AdminUsersClientProps) {
  const router = useRouter();

  async function handleRoleChange(userId: string, role: string | null) {
    if (!role) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error);
        return;
      }

      toast.success("Role updated");
      router.refresh();
    } catch {
      toast.error("Failed to update role");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">User management</h1>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead /> 
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground py-8"
                >
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">
                    {u.name ?? "—"}
                  </TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Badge
                      className={roleColors[u.role] ?? ""}
                      variant="outline"
                    >
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Select
                      defaultValue={u.role as string}
                      onValueChange={(val) => handleRoleChange(u.id, val)}
                    >
                      <SelectTrigger className="w-28 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
