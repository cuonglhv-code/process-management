"use client";

import { useEffect, useRef } from "react";
import { X, Download, ExternalLink, FileIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface FormData {
  id: string;
  label: string;
  url: string;
  type: string;
}

interface StepDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  step: {
    id: string;
    label: string;
    type: string;
    order: number;
    responsibleRole: string | null;
    helpText: string | null;
    richNotes: string | null;
    linkedForms: FormData[];
  } | null;
}

const typeLabels: Record<string, string> = {
  action: "Action",
  decision: "Decision",
  terminal: "Terminal",
  annotation: "Annotation",
};

export function StepDetailDrawer({
  open,
  onClose,
  step,
}: StepDetailDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [open, onClose]);

  if (!open || !step) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      <div
        ref={drawerRef}
        className="fixed top-0 right-0 h-full w-[400px] bg-white shadow-xl z-50
                   transform transition-transform duration-300 ease-in-out
                   overflow-y-auto"
      >
        <div className="p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">{step.label}</h2>
              <Badge variant="secondary">{typeLabels[step.type] ?? step.type}</Badge>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-accent"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {step.responsibleRole && (
            <div>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Who handles this
              </h3>
              <p className="mt-1 text-sm">{step.responsibleRole}</p>
            </div>
          )}

          {step.helpText && (
            <div>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Guidance
              </h3>
              <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap">
                {step.helpText}
              </p>
            </div>
          )}

          {step.richNotes && (
            <div>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Notes
              </h3>
              <div
                className="mt-1 text-sm leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: step.richNotes,
                }}
              />
            </div>
          )}

          {step.linkedForms.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                  Linked forms
                </h3>
                <div className="space-y-2">
                  {step.linkedForms.map((form) => (
                    <div
                      key={form.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="text-sm truncate">{form.label}</span>
                      </div>
                      <Button variant="outline" size="sm">
                        <a
                          href={form.url}
                          target={
                            form.type === "download" ? "_self" : "_blank"
                          }
                          download={form.type === "download"}
                        >
                          {form.type === "download" ? (
                            <>
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </>
                          ) : (
                            <>
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Open
                            </>
                          )}
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
