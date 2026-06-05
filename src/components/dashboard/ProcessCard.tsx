import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Calendar, User, StickyNote } from "lucide-react";

interface ProcessCardProps {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  ownerName: string | null;
  stepCount: number;
  updatedAt: Date;
  published: boolean;
}

export function ProcessCard({
  id,
  title,
  description,
  category,
  ownerName,
  stepCount,
  updatedAt,
  published,
}: ProcessCardProps) {
  return (
    <Link href={`/processes/${id}`}>
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 min-w-0">
              <h3 className="font-semibold truncate">{title}</h3>
              {category && (
                <Badge variant="secondary" className="bg-brand-teal/10 text-brand-teal border-0">
                  {category}
                </Badge>
              )}
            </div>
            <Badge
              variant={published ? "default" : "outline"}
              className={
                published
                  ? "bg-brand-teal text-white"
                  : "text-muted-foreground"
              }
            >
              {published ? "Published" : "Draft"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          )}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {ownerName && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {ownerName}
              </span>
            )}
            <span className="flex items-center gap-1">
              <StickyNote className="h-3 w-3" />
              {stepCount} steps
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(updatedAt).toLocaleDateString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
