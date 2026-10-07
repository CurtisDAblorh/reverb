"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createPlaylist } from "@/store/librarySlice";
import { setPanel } from "@/store/uiSlice";

export function CreatePlaylistDialog() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const open = useAppSelector((s) => s.ui.createPlaylist);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const close = () => {
    dispatch(setPanel({ panel: "createPlaylist", open: false }));
    setName("");
    setDescription("");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const action = dispatch(createPlaylist({ name, description }));
    toast.success(`Created “${action.payload.name}”`);
    close();
    router.push(`/playlist/?id=${action.payload.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? null : close())}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>New playlist</DialogTitle>
            <DialogDescription>Give it a name. You can add tracks from any list.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <label htmlFor="pl-name" className="text-sm font-medium">
              Name
            </label>
            <Input
              id="pl-name"
              autoFocus
              value={name}
              maxLength={60}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sunday reset"
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="pl-desc" className="text-sm font-medium">
              Description <span className="text-muted-foreground">(optional)</span>
            </label>
            <Textarea
              id="pl-desc"
              value={description}
              maxLength={200}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's the vibe?"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
