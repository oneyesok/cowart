---
name: open-cowart-canvas
description: Open the Cowart local web service, a tldraw-powered infinite canvas, in the Codex in-app browser. Use when the user asks to open, launch, view, or work in the Cowart canvas or wants an infinite canvas inside Codex.
---

# Open Cowart Canvas

## Workflow

Start the local Cowart web service with the user's current Codex project directory:

```bash
/Users/bytedance/plugins/cowart/scripts/start-canvas.sh /path/to/user/codex-project
```

Use the active workspace or project directory from the current Codex session for `/path/to/user/codex-project`. Do not pass the Cowart plugin directory. If the script is run without an argument, it falls back to the caller's current working directory.

Keep that process running. It serves the tldraw infinite canvas at:

```text
http://127.0.0.1:43217
```

If `COWART_PORT` is set before starting the script, open that port instead:

```bash
COWART_PORT=43218 /Users/bytedance/plugins/cowart/scripts/start-canvas.sh /path/to/user/codex-project
```

Then use the in-app browser to open the URL. If the browser-control skill is available, use it for the navigation. Otherwise, give the user the local URL.

## Notes

The canvas data is stored on disk in the user's Codex project canvas folder:

```text
canvas/cowart-canvas.json
```

The React app loads that file through the local Vite API before mounting `tldraw`, and saves `tldraw` store snapshots back to the same file when the document changes. This means canvas data lives in the project folder rather than in browser local storage.

The project folder can be supplied either as the first script argument or with `COWART_PROJECT_DIR`:

```bash
COWART_PROJECT_DIR=/path/to/project /Users/bytedance/plugins/cowart/scripts/start-canvas.sh
```

Both forms write to `/path/to/project/canvas/cowart-canvas.json`. If a caller needs an exact directory, set `COWART_CANVAS_DIR`; it takes precedence over both the first argument and `COWART_PROJECT_DIR`.
