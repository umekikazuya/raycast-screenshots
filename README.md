# Raycast(Tinycast) Extention for Screenshots

A macOS extension for Raycast and [Tinycast](https://tinycast.dev/) to quickly find, preview, and manage recent screenshots.

- [![Raycast Extension](https://img.shields.io/badge/Raycast-Extension-blue?logo=raycast)](https://raycast.com)

## Key Features

- **Recent Screenshots**: Browse up to 100 images in a thumbnail grid, newest first by creation date.
- **Filename Search**: Filter the latest images by filename.
- **Quick Actions**: Copy image files, open them in the default app, reveal them in Finder, or move them to Trash.
- **Local Processing**: Uses file metadata without OCR or network requests.

## Usage

![Raycast Extension for Screenshots](https://raw.githubusercontent.com/umekikazuya/raycast-screenshots/refs/heads/assets/image.png)

1. Run **Search Screenshots** in Raycast or Tinycast.
2. Type part of a filename to filter the gallery.
3. Select an image and press `Enter` to copy the file to the clipboard, or open the action panel with `⌘K` for more actions:
   - **Copy Screenshot to Clipboard**: Copies the image file, not its path.
   - **Open Screenshot**: Opens the image in the default app.
   - **Show in Finder**: Reveals the file in Finder.
   - **Move to Trash**: Moves the file to Trash and removes it from the gallery.

The gallery includes all `.png`, `.jpg`, `.jpeg`, `.heic`, `.tif`, and `.tiff` files directly inside the selected folder, not only screenshots. Subfolders are not scanned. Modification time is used if creation time is unavailable.

## Settings

- **Screenshot Directory**: Folder to browse. Defaults to `~/Desktop` when unset. Custom macOS screenshot locations are not detected automatically.
- **Grid Item Size**: Choose Small, Medium, or Large. Defaults to Medium.

Change these preferences in your launcher's extension settings.

## Installation (Tinycast)

Use Tinycast's **Import from GitHub** feature with this repository: [umekikazuya/raycast-screenshots](https://github.com/umekikazuya/raycast-screenshots)

See [Tinycast's installation guide](https://tinycast.dev/docs/extensions/installing/) for requirements and details.

## License

This extension is released under the [MIT License](LICENSE).
