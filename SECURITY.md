# Security Policy

Cowart runs a local Vite service and writes canvas data into the active project directory.

## Local-first assumptions

- The default server binds to `127.0.0.1`.
- Canvas snapshots are saved under the configured `canvas/` directory.
- Page assets are copied into page-local asset folders.
- Cowart is intended for trusted local workspaces, not for hosting on a public server.

## Recommended usage

- Run Cowart only for projects you trust.
- Do not expose the local Cowart port to the public internet.
- Review generated or imported images before publishing them.
- Keep important project files backed up before experimenting with automated canvas edits.

## Reporting issues

If you find a security issue, please avoid posting exploit details publicly first. Open a private report or contact the maintainer listed in the project metadata.
