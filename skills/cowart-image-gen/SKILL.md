---
name: cowart-image-gen
description: Generate a final AI bitmap into the selected Cowart "AI 图片" holder, including any requested in-image text by default. Use when the user asks Codex to create, fill, replace, or place an AI-generated image inside the currently selected AI image placeholder on a Cowart canvas.
---

# Cowart Image Gen

Use this skill when the selected Cowart canvas shape is an `AI 图片` holder created by the Cowart toolbar.

This is the corrected canonical skill name. The legacy `cowart-imgae-gen` skill remains available for backwards compatibility.

## Preconditions

The Cowart service should be running for the user's active project, usually at:

```text
http://127.0.0.1:43217
```

New holders are tldraw `frame` shapes with:

```json
{
  "type": "frame",
  "meta": {
    "cowartAiImageHolder": true
  }
}
```

Older canvases may still contain legacy `geo` rectangle holders with the same meta flag. Support both shapes.

## Workflow

1. Read the selected shape from Cowart:

   ```bash
   curl -s http://127.0.0.1:43217/api/selection
   ```

   You can also use the Cowart MCP `get_cowart_selection` tool if it is available.

2. Continue only when exactly one selected shape has either `isAiImageHolder: true` or `meta.cowartAiImageHolder: true`. If not, ask the user to select an `AI 图片` holder.

3. Use the selected holder's `props.w` and `props.h` as the size contract. The generated image should match the holder aspect ratio as closely as possible.

4. Generate the bitmap with the built-in `imagegen` skill unless the user explicitly requests another image path. If the requested asset needs visible copy, labels, poster text, ad text, UI text, or typography, include that text directly in the image generation prompt.

5. Insert the generated image as a new tldraw image shape exactly over the holder:

   - For frame holders, use the holder id as `parentId` and place the image at `x: 0`, `y: 0`, `rotation: 0`.
   - For legacy geo holders, use the holder's existing placement, parent, rotation, width, and height.
   - Set `meta.cowartGeneratedForAiImageHolder` to the holder shape id.

6. Do not delete the holder unless the user explicitly asks for replacement. Keeping the holder lets Codex identify the intended slot again later.

7. Save through Cowart's API or edit the page snapshot carefully:

   ```bash
   curl -s http://127.0.0.1:43217/api/canvas
   ```

   Prefer page-local asset URLs in the image asset:

   ```text
   /page-assets/<page-id-without-page-prefix>/<filename>
   ```

8. Refresh or let the browser hot-reload, then confirm the inserted shape id, holder id, final dimensions, and saved asset path.

## Notes

- If the holder is a legacy rotated `geo` rectangle, preserve the same `rotation` on the image.
- If there is already a generated image for the same holder and the user says "替换", remove or update that generated image shape instead of piling another copy on top.
- Never overwrite an existing asset file without an explicit replace request; use a timestamped filename.
