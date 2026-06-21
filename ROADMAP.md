# Cowart Roadmap

This roadmap keeps near-term improvements small and practical.

## Reliability

- Add a smoke test for starting the local canvas service.
- Validate MCP tool responses against expected schemas.
- Improve error messages when the canvas service is not running.
- Add recovery guidance for malformed canvas snapshots.

## Creator workflow

- Add reusable templates for image generation, annotation review, and before/after comparison.
- Make annotation-to-image revision work without a manual screenshot when a unique source image is selected.
- Preserve prompt, source image, and revision notes as visible canvas metadata.
- Add export helpers for common social and article image ratios.

## Open source hygiene

- Clarify licensing with the original author before adding an OSS license.
- Keep the legacy `cowart-imgae-gen` skill name working until users migrate.
- Add contribution guidelines once the public API stabilizes.
- Add CI checks for install, doctor, and production build.
