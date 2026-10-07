import type { Decorator, Preview } from "@storybook/nextjs-vite";
import { useEffect, type ReactNode } from "react";
import { Bricolage_Grotesque, Geist } from "next/font/google";
import { StoreProvider } from "../src/components/providers/StoreProvider";
import { TooltipProvider } from "../src/components/ui/tooltip";
import { Toaster } from "../src/components/ui/sonner";
import { DEMO_TRACKS, seedHistory } from "../src/lib/mock/catalog";
import { initialLibraryState } from "../src/store/librarySlice";
import { initialPlayerState } from "../src/store/playerSlice";
import "../src/app/globals.css";

const sans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const display = Bricolage_Grotesque({ variable: "--font-display", subsets: ["latin"] });

/** Applies the toolbar theme to <html> so shadcn's `.dark` tokens kick in. */
function ThemeFrame({ theme, children }: { theme: string; children: ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    // Font variables go on <html> so portalled dialogs and menus pick them up too.
    root.classList.add(sans.variable, display.variable, "font-sans", "antialiased");
  }, [theme]);
  return <div className="min-h-screen bg-background p-6 text-foreground">{children}</div>;
}

const withTheme: Decorator = (Story, ctx) => (
  <ThemeFrame theme={ctx.globals.theme ?? "dark"}>
    <Story />
  </ThemeFrame>
);

/** Every story gets an isolated store with a demo queue and seeded history. */
const withStore: Decorator = (Story, ctx) => (
  <StoreProvider
    skipHydration
    preloadedState={{
      player: {
        ...initialPlayerState,
        queue: DEMO_TRACKS.slice(0, 8),
        index: ctx.parameters.playing === false ? -1 : 0,
      },
      library: {
        ...initialLibraryState,
        history: seedHistory(Date.UTC(2026, 9, 1)),
        hydrated: true,
      },
    }}
  >
    <TooltipProvider>
      <Story />
      <Toaster />
    </TooltipProvider>
  </StoreProvider>
);

const preview: Preview = {
  decorators: [withStore, withTheme],
  globalTypes: {
    theme: {
      description: "Colour theme",
      toolbar: {
        title: "Theme",
        icon: "mirror",
        items: [
          { value: "dark", title: "Dark" },
          { value: "light", title: "Light" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "dark" },
  parameters: {
    layout: "fullscreen",
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // 'todo' - show a11y violations in the test UI only
      test: "todo",
    },
  },
};

export default preview;
