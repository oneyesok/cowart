# Contributing

Thanks for improving Cowart. Keep contributions small, local-first, and easy to verify.

## Before you start

- Use Node.js 22 or any Node version compatible with `>=20.19.0`.
- Run `npm ci` after cloning.
- Remember that Cowart writes canvas data into the active project directory, usually `canvas/`.

## Local checks

Before opening a pull request, run:

```bash
npm run check
```

This runs the project doctor, production build, local server smoke test, and MCP protocol smoke test.

## Change guidelines

- Prefer project-local persistence over global state.
- Do not expose the local service beyond `127.0.0.1` unless there is a clear security review.
- Keep backwards-compatible skill aliases when renaming Codex-facing commands.
- Add or update smoke coverage when changing Vite middleware or MCP-facing endpoints.
- Run `npm run test:mcp` when changing `mcp/server.mjs` or tool schemas.
- Document user-facing behavior in both `README.md` and `README.en.md` when practical.
- Update [docs/API.md](docs/API.md) when changing HTTP endpoints or MCP tools.

## Pull requests

Use the pull request template and include:

- a short summary of the change
- verification output, usually `npm run check`
- notes about compatibility or local-storage behavior when relevant

## Licensing

The upstream project currently has no open source license. Do not add a license to a fork unless you have the rights to license the original code.
