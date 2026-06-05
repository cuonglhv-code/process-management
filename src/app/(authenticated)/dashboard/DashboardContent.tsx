"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Library } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ProcessCard } from "@/components/dashboard/ProcessCard";

interface ProcessData {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  ownerName: string | null;
  stepCount: number;
  updatedAt: string;
  published: boolean;
}

interface DashboardContentProps {
  userId: string;
  role: string;
  categories: string[];
}

export function DashboardContent({
  userId,
  role,
  categories,
}: DashboardContentProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [processes, setProcesses] = useState<ProcessData[]>([]);
  const [loading, setLoading] = useState(true);

  const isOwnerOrAdmin = role === "owner" || role === "admin";

  const fetchProcesses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (selectedCategory) params.set("category", selectedCategory);

      const res = await fetch(`/api/processes?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProcesses(data);
      }
    } finally {
      setLoading(false);
    }
  }, [query, selectedCategory]);

  useEffect(() => {
    const timer = setTimeout(fetchProcesses, 300);
    return () => clearTimeout(timer);
  }, [fetchProcesses]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Process Library</h1>
        {isOwnerOrAdmin && (
          <Button onClick={() => router.push("/processes/new")}>
            <Plus className="h-4 w-4 mr-2" />
            New process
          </Button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search processes by title, description, tags, or category..."
          className="pl-10 h-12 text-base"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={selectedCategory === null ? "default" : "outline"}
            className={
              selectedCategory === null
                ? "bg-brand-teal text-white cursor-pointer"
                : "cursor-pointer"
            }
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Badge>
          {categories.map((cat) => (
            <Badge
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              className={
                selectedCategory === cat
                  ? "bg-brand-teal text-white cursor-pointer"
                  : "cursor-pointer"
              }
              onClick={() =>
                setSelectedCategory(cat === selectedCategory ? null : cat)
              }
            >
              {cat}
            </Badge>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3 p-4 border rounded-lg">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : processes.length === 0 ? (
        <div className="text-center py-16">
          <Library className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No processes found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {query
              ? "Try a different search term"
              : isOwnerOrAdmin
              ? "Create your first process to get started"
              : "There are no published processes yet"}
          </p>
          {isOwnerOrAdmin && !query && (
            <Button className="mt-4" onClick={() => router.push("/processes/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Create process
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {processes.map((p) => (
            <ProcessCard
              key={p.id}
              id={p.id}
              title={p.title}
              description={p.description}
              category={p.category}
              ownerName={p.ownerName}
              stepCount={p.stepCount}
              updatedAt={new Date(p.updatedAt)}
              published={p.published}
            />
          ))}
        </div>
      )}
    </div>
  );
}
