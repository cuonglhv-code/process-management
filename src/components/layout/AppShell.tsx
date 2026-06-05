"use client";

import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

interface AppShellProps {
  children: React.ReactNode;
  name: string | null;
  email: string;
  role: string;
}

export function AppShell({ children, name, email, role }: AppShellProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col">
        <Topbar name={name} email={email} role={role} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
