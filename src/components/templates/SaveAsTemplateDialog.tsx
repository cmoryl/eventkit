import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Bookmark, Loader2, Lock, Globe2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export type DeckTemplateSourceKind = "preview" | "deck";

export interface SaveTemplatePayload {
  name: string;
  description: string | null;
  is_shared: boolean;
  source_kind: DeckTemplateSourceKind;
  palette: { bg: string; text: string; accent: string; secondary: string };
  theme_prompt?: string | null;
  content: unknown;
  thumbnail?: string | null;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-fills the dialog and supplies what to save */
  defaults: Pick<SaveTemplatePayload, "source_kind" | "palette" | "content"> & {
    name?: string;
    description?: string | null;
    theme_prompt?: string | null;
    thumbnail?: string | null;
  };
  onSaved?: (id: string) => void;
}

export const SaveAsTemplateDialog: React.FC<Props> = ({ open, onOpenChange, defaults, onSaved }) => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState(defaults.name || "");
  const [description, setDescription] = useState(defaults.description || "");
  const [isShared, setIsShared] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [saving, setSaving] = useState(false);

  // Reset on open
  useEffect(() => {
    if (open) {
      setName(defaults.name || "");
      setDescription(defaults.description || "");
      setIsShared(false);
    }
  }, [open, defaults.name, defaults.description]);

  // Detect admin role to enable the "Shared" toggle
  useEffect(() => {
    let active = true;
    if (!user?.id) {
      setIsAdmin(false);
      return;
    }
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data }) => {
        if (active) setIsAdmin(!!data);
      });
    return () => {
      active = false;
    };
  }, [user?.id]);

  const handleSave = async () => {
    if (!isAuthenticated || !user?.id) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save templates.",
        variant: "destructive",
      });
      return;
    }
    const trimmed = name.trim();
    if (!trimmed) {
      toast({ title: "Name required", description: "Give your template a name.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("deck_templates")
        .insert({
          user_id: user.id,
          name: trimmed,
          description: description.trim() || null,
          source_kind: defaults.source_kind,
          palette: defaults.palette as any,
          theme_prompt: defaults.theme_prompt || null,
          content: defaults.content as any,
          thumbnail: defaults.thumbnail || null,
          is_shared: isAdmin && isShared,
        })
        .select("id")
        .single();
      if (error) throw error;

      toast({
        title: "Template saved",
        description: isShared
          ? `"${trimmed}" is now available to all users.`
          : `"${trimmed}" was added to your template library.`,
      });
      onSaved?.(data.id);
      onOpenChange(false);
    } catch (e) {
      console.error("[SaveAsTemplate] failed:", e);
      toast({
        title: "Couldn't save template",
        description: e instanceof Error ? e.message : "Unexpected error",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !saving && onOpenChange(o)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bookmark className="h-4 w-4 text-primary" />
            Save as Template
          </DialogTitle>
          <DialogDescription>
            Reuse this {defaults.source_kind === "deck" ? "deck" : "look & content"} as a starting point for future presentations.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="tmpl-name">Template name</Label>
            <Input
              id="tmpl-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Q4 Investor Pitch"
              maxLength={80}
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tmpl-desc">Description (optional)</Label>
            <Textarea
              id="tmpl-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="When to reach for this template…"
              rows={3}
              maxLength={300}
            />
          </div>

          <div
            className={`flex items-start justify-between gap-3 rounded-lg border p-3 ${
              isAdmin ? "bg-card" : "bg-muted/30"
            }`}
          >
            <div className="flex items-start gap-2.5 min-w-0">
              {isShared ? (
                <Globe2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
              ) : (
                <Lock className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              )}
              <div className="min-w-0">
                <div className="text-sm font-medium">
                  {isShared ? "Shared with everyone" : "Private to you"}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isAdmin
                    ? "Toggle on to make this template visible in every user's gallery."
                    : "Only you will see this template. Admins can publish templates to all users."}
                </p>
              </div>
            </div>
            <Switch
              checked={isShared}
              onCheckedChange={setIsShared}
              disabled={!isAdmin}
              aria-label="Share with all users"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !name.trim()}>
            {saving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Bookmark className="h-3.5 w-3.5 mr-1.5" />
                Save template
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
