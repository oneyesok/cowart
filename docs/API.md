# Cowart API and MCP reference

Cowart exposes a local Vite HTTP API for the canvas web app and a JSON-RPC MCP server for Codex/plugin automation.

Cowart is designed for trusted local workspaces. Do not expose these endpoints to the public internet.

## Local HTTP API

Default base URL:

```text
http://127.0.0.1:43217
```

### `GET /api/health`

Returns service status and storage context.

```json
{
  "ok": true,
  "name": "cowart-canvas",
  "version": "0.1.2",
  "projectDir": "/path/to/project",
  "canvasDir": "/path/to/project/canvas",
  "storage": "empty",
  "canvasPath": "/path/to/project/canvas/pages",
  "updatedAt": "2026-06-21T00:00:00.000Z"
}
```

### `GET /api/canvas`

Returns the current canvas snapshot and storage metadata.

When no canvas has been saved yet, `snapshot` is `null` and `storage` is `empty`.

### `PUT /api/canvas`

Saves a tldraw store snapshot. The body must include `schema` and `store`.

Cowart saves page snapshots under:

```text
canvas/pages/<page-id>/cowart-canvas.json
```

### `GET /api/selection`

Returns the current browser selection persisted by the Cowart web app.

### `PUT /api/selection`

Persists the current selected shape list. The body must include `selectedShapes`.

### `GET /api/view-state`

Returns the current page id and camera state.

### `PUT /api/view-state`

Persists the current page id and camera state.

### `GET /api/canvas-events`

Server-sent events stream that notifies clients after canvas saves.

### `/assets/*` and `/page-assets/*`

Serve local canvas assets. Paths are constrained to the configured canvas asset directories.

## MCP server

The MCP server entrypoint is:

```bash
node mcp/server.mjs
```

It speaks line-delimited JSON-RPC over stdin/stdout.

### `get_cowart_selection`

Reads `canvas/cowart-selection.json` for the active project and returns selected shape metadata.

Arguments:

- `projectDir`: absolute project directory; reads `<projectDir>/canvas/cowart-selection.json`.
- `canvasDir`: absolute canvas directory; overrides `projectDir`.

### `insert_cowart_image`

Copies a local bitmap into the active page asset folder, creates a tldraw image asset and shape, places it near an anchor shape or clear page area, and saves through `/api/canvas`.

Required argument:

- `imagePath`: absolute local bitmap path.

Useful optional arguments:

- `projectDir` or `canvasDir`
- `cowartUrl`
- `pageId`
- `anchorShapeId` or `sourceShapeId`
- `placement`: `right`, `left`, or `below`
- `matchAnchor`
- `displayWidth` and `displayHeight`
- `shapeMeta` and `assetMeta`

## Verification

Run all local checks:

```bash
npm run check
```

Run only the HTTP service smoke test:

```bash
npm run test:smoke
```

Run only the MCP protocol smoke test:

```bash
npm run test:mcp
```
