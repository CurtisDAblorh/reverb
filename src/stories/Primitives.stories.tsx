import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Heart, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const meta: Meta = {
  title: "Primitives/shadcn",
};
export default meta;

export const Buttons: StoryObj = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button>
        <Play className="fill-current" /> Play
      </Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Delete</Button>
      <Button variant="link">Link</Button>
      <Button size="icon" aria-label="Like">
        <Heart />
      </Button>
      <Button className="rounded-full bg-[#1DB954] text-black hover:bg-[#1ed760]">
        Connect Spotify
      </Button>
    </div>
  ),
};

export const FormControls: StoryObj = {
  render: () => (
    <div className="grid max-w-sm gap-6">
      <Input placeholder="Search tracks" aria-label="Search" />
      <Slider defaultValue={[60]} aria-label="Volume" />
      <label className="flex items-center gap-3 text-sm">
        <Switch defaultChecked /> Crossfade
      </label>
      <div className="flex gap-2">
        <Badge>Electronic</Badge>
        <Badge variant="secondary">128 BPM</Badge>
        <Badge variant="outline">Preview</Badge>
      </div>
    </div>
  ),
};

export const CardAndTabs: StoryObj = {
  render: () => (
    <Card className="glass max-w-md">
      <CardHeader>
        <CardTitle>Your library</CardTitle>
        <CardDescription>Glass card with shadcn tabs</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="playlists">
          <TabsList>
            <TabsTrigger value="playlists">Playlists</TabsTrigger>
            <TabsTrigger value="liked">Liked</TabsTrigger>
          </TabsList>
          <TabsContent value="playlists" className="pt-4 text-sm text-muted-foreground">
            Deep Focus · Hype Mode
          </TabsContent>
          <TabsContent value="liked" className="pt-4 text-sm text-muted-foreground">
            No liked songs yet.
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  ),
};
