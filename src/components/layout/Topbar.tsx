"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { LogOut, User } from "lucide-react";

interface TopbarProps {
  name: string | null;
  email: string;
  role: string;
}

const roleBadgeVariant: Record<string, "default" | "secondary" | "destructive"> = {
  admin: "default",
  owner: "secondary",
  staff: "secondary",
};

const roleBadgeClass: Record<string, string> = {
  admin: "bg-brand-purple text-white hover:bg-brand-purple/90",
  owner: "bg-brand-teal text-white hover:bg-brand-teal/90",
  staff: "bg-muted text-muted-foreground",
};

export function Topbar({ name, email, role }: TopbarProps) {
  const router = useRouter();
  const initials = (name ?? email).slice(0, 2).toUpperCase();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="h-14 border-b border-border bg-white flex items-center justify-end px-6 gap-3">
      <Badge className={roleBadgeClass[role] ?? "bg-muted"} variant="outline">
        {role}
      </Badge>

      <DropdownMenu>
        <DropdownMenuTrigger>
          <button className="flex items-center gap-2 outline-none">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs bg-brand-teal text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium hidden sm:block">
              {name ?? email}
            </span>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span>{name ?? "User"}</span>
              <span className="text-xs text-muted-foreground font-normal">
                {email}
              </span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
