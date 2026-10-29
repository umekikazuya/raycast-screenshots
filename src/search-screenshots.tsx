import { Action, ActionPanel, Grid, Icon, getPreferenceValues, showToast, Toast } from "@raycast/api";
import { readdir, stat } from "node:fs/promises";
import { homedir } from "node:os";
import { basename, extname, join } from "node:path";
import { useEffect, useState } from "react";

type GridItemSize = "small" | "medium" | "large";
const GRID_ITEM_SIZES: Record<GridItemSize, Grid.ItemSize> = {
  small: Grid.ItemSize.Small,
  medium: Grid.ItemSize.Medium,
  large: Grid.ItemSize.Large,
};

interface SearchPreferences {
  screenshotDirectory?: string;
  gridItemSize?: GridItemSize;
}

interface Screenshot {
  path: string;
  name: string;
  createdAt: number;
}

const MAX_SCREENSHOTS = 100;
const STAT_BATCH_SIZE = 32;
const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".heic", ".tif", ".tiff"]);

function getScreenshotDirectory(preference: string | undefined): string {
  const configuredDirectory = preference?.trim();
  const directory = configuredDirectory || join(homedir(), "Desktop");

  if (directory === "~") {
    return homedir();
  }

  if (directory.startsWith("~/")) {
    return join(homedir(), directory.slice(2));
  }

  return directory;
}

async function loadScreenshots(directory: string): Promise<Screenshot[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const imagePaths = entries
    .filter((entry) => entry.isFile() && IMAGE_EXTENSIONS.has(extname(entry.name).toLowerCase()))
    .map((entry) => join(directory, entry.name));
  const screenshots: Screenshot[] = [];

  for (let index = 0; index < imagePaths.length; index += STAT_BATCH_SIZE) {
    const batch = imagePaths.slice(index, index + STAT_BATCH_SIZE);
    const results = await Promise.all(
      batch.map(async (path): Promise<Screenshot | undefined> => {
        try {
          const fileStats = await stat(path);
          return {
            path,
            name: basename(path),
            createdAt: fileStats.birthtimeMs > 0 ? fileStats.birthtimeMs : fileStats.mtimeMs,
          };
        } catch (error) {
          if (typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT") {
            return undefined;
          }
          throw error;
        }
      }),
    );
    screenshots.push(...results.filter((screenshot): screenshot is Screenshot => screenshot !== undefined));
  }

  return screenshots.sort((left, right) => right.createdAt - left.createdAt).slice(0, MAX_SCREENSHOTS);
}

export default function SearchScreenshots() {
  const preferences = getPreferenceValues<SearchPreferences>();
  const directory = getScreenshotDirectory(preferences.screenshotDirectory);
  const itemSize = GRID_ITEM_SIZES[preferences.gridItemSize ?? "medium"];
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCurrent = true;

    async function fetchScreenshots() {
      try {
        const files = await loadScreenshots(directory);
        if (isCurrent) {
          setScreenshots(files);
        }
      } catch (error) {
        if (isCurrent) {
          const message = error instanceof Error ? error.message : String(error);
          await showToast({
            style: Toast.Style.Failure,
            title: "Unable to Load Screenshots",
            message,
          });
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    void fetchScreenshots();
    return () => {
      isCurrent = false;
    };
  }, [directory]);

  const matchingScreenshots = screenshots.filter((screenshot) =>
    screenshot.name.toLowerCase().includes(searchText.trim().toLowerCase()),
  );

  return (
    <Grid
      itemSize={itemSize}
      isLoading={isLoading}
      searchText={searchText}
      onSearchTextChange={setSearchText}
      filtering={false}
      searchBarPlaceholder="Search screenshots by filename..."
      navigationTitle="Recent Screenshots"
    >
      <Grid.EmptyView
        title={searchText ? "No Matching Screenshots" : "No Screenshots Found"}
        description={searchText ? "Try a different filename." : `No image files found in ${directory}.`}
        icon={Icon.Image}
      />
      {matchingScreenshots.map((screenshot) => (
        <Grid.Item
          key={screenshot.path}
          content={screenshot.path}
          title={screenshot.name}
          subtitle={new Date(screenshot.createdAt).toLocaleString()}
          actions={
            <ActionPanel>
              <Action.Open title="Open Screenshot" target={screenshot.path} />
              <Action.ShowInFinder path={screenshot.path} />
              <Action.CopyToClipboard
                title="Copy Screenshot to Clipboard"
                content={{ file: screenshot.path }}
                icon={Icon.Clipboard}
              />
              <Action.Trash
                paths={screenshot.path}
                onTrash={() => setScreenshots((current) => current.filter((item) => item.path !== screenshot.path))}
              />
            </ActionPanel>
          }
        />
      ))}
    </Grid>
  );
}
