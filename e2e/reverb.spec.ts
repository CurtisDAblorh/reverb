import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("feel the music");
});

test("plays a mood and updates the player bar", async ({ page }) => {
  await page.getByTestId("mood-jazz").click();
  const player = page.getByTestId("player-bar");
  await expect(player.getByTestId("now-playing-title")).not.toHaveText("Nothing playing");
  await expect(player.getByRole("button", { name: "Pause", exact: true })).toBeVisible();
  await expect(page.locator("[data-genre]").first()).toHaveAttribute("data-genre", "jazz");

  await player.getByRole("button", { name: "Pause", exact: true }).click();
  await expect(player.getByRole("button", { name: "Play", exact: true })).toBeVisible();
});

test("opens the full-screen visualiser", async ({ page }) => {
  await page.getByTestId("mood-electronic").click();
  await page.getByRole("button", { name: "Open full-screen player" }).click();
  const dialog = page.getByRole("dialog", { name: "Now playing" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByTestId("visualizer")).toHaveAttribute("data-mode", "bars");
  await dialog
    .getByRole("radio", { name: "Wave" })
    .or(dialog.getByRole("button", { name: "Wave" }))
    .click();
  await expect(dialog.getByTestId("visualizer")).toHaveAttribute("data-mode", "wave");
  await dialog.getByRole("button", { name: "Close now playing" }).click();
  await expect(dialog).toBeHidden();
});

test("creates a playlist, adds a track and persists it", async ({ page }) => {
  await page.goto("/library/");
  await page.getByRole("button", { name: "New playlist" }).click();
  await page.getByLabel("Name").fill("E2E Mix");
  await page.getByRole("button", { name: "Create" }).click();

  await expect(page).toHaveURL(/\/playlist\/\?id=pl-/);
  await expect(page.getByRole("heading", { name: "E2E Mix" })).toBeVisible();
  await expect(page.getByRole("dialog")).toBeHidden();
  await page
    .getByRole("button", { name: /^Add .* to playlist$/ })
    .first()
    .click();
  await expect(page.getByTestId("track-row")).toHaveCount(1);

  await page.reload();
  await expect(page.getByRole("heading", { name: "E2E Mix" })).toBeVisible();
  await expect(page.getByTestId("track-row")).toHaveCount(1);
});

test("likes a track from a list", async ({ page }) => {
  await page.goto("/search/");
  const first = page.getByTestId("track-row").first();
  await first.getByRole("button", { name: /^Like / }).click();
  await page.goto("/library/?tab=liked");
  await expect(page.getByTestId("track-row")).toHaveCount(1);
});

test("filters search results by genre", async ({ page }) => {
  await page.goto("/search/");
  await page.getByRole("button", { name: "Ambient", exact: true }).click();
  await expect(page).toHaveURL(/genre=ambient/);
  const rows = page.getByTestId("track-row");
  await expect(rows.first()).toBeVisible();
  const genres = await rows.evaluateAll((els) => els.map((el) => el.getAttribute("data-genre")));
  expect(new Set(genres)).toEqual(new Set(["ambient"]));

  await page.getByRole("searchbox", { name: "Search tracks" }).fill("zzzz-no-match");
  await expect(page.getByText("No tracks match")).toBeVisible();
});

test("renders the D3 stats dashboard and filters by genre", async ({ page }) => {
  await page.goto("/stats/");
  const donut = page.getByTestId("genre-donut");
  await expect(donut.locator("path").first()).toBeVisible();
  await expect(page.getByTestId("artist-graph").locator("circle").first()).toBeVisible();
  await expect(page.getByTestId("activity-heatmap").locator("rect").first()).toBeAttached();

  const before = await page.getByTestId("stat-plays").innerText();
  await donut.locator("path").first().click();
  await expect(page.getByTestId("stat-plays")).not.toHaveText(before);
});

test.describe("keyboard", () => {
  test.skip(({ isMobile }) => isMobile, "keyboard shortcuts are desktop-only");

  test("controls playback and opens the command palette", async ({ page }) => {
    await page.getByTestId("mood-pop").click();
    await page.locator("body").click({ position: { x: 5, y: 5 } });
    await page.keyboard.press("Space");
    await expect(
      page.getByTestId("player-bar").getByRole("button", { name: "Play", exact: true }),
    ).toBeVisible();

    await page.keyboard.press("Control+k");
    const palette = page.getByRole("dialog");
    await palette.getByRole("combobox").fill("Smoke Rings");
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("now-playing-title")).toHaveText("Smoke Rings");
    await expect(palette).toBeHidden();

    await page.keyboard.press("?");
    await expect(page.getByRole("heading", { name: "Keyboard shortcuts" })).toBeVisible();
  });
});
