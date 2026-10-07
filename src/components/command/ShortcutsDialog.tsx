"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SHORTCUTS } from "@/hooks/useKeyboardShortcuts";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setPanel } from "@/store/uiSlice";

export function ShortcutsDialog() {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.ui.shortcuts);

  return (
    <Dialog open={open} onOpenChange={(o) => dispatch(setPanel({ panel: "shortcuts", open: o }))}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>Control Reverb without touching the mouse.</DialogDescription>
        </DialogHeader>
        <ul className="grid gap-2">
          {SHORTCUTS.map((s) => (
            <li key={s.label} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{s.label}</span>
              <span className="flex gap-1">
                {s.keys.map((k) => (
                  <kbd
                    key={k}
                    className="min-w-7 rounded-md border bg-muted px-1.5 py-0.5 text-center font-mono text-xs"
                  >
                    {k}
                  </kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
