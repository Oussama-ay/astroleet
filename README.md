# my-project

Next.js application built with React 19, Tailwind CSS, MUI, and pnpm.

## Requirements

- Node.js 22 or newer
- Corepack, which is included with modern Node.js releases

This project uses `pnpm-lock.yaml`, so use pnpm instead of npm or yarn. You do not need to install pnpm globally if Corepack is available.

## First-time setup

From the project root:

```bash
corepack enable
corepack pnpm install
```

The repository includes `pnpm-workspace.yaml` with approved dependency build scripts:

```yaml
allowBuilds:
  msw: true
  sharp: true
```

Keep these values set to `true`. Without them, pnpm may stop with this error:

```text
ERR_PNPM_IGNORED_BUILDS Ignored build scripts: msw, sharp
```

`sharp` is used by Next.js image tooling, and `msw` runs its package setup script. Approving those builds lets `pnpm install` complete cleanly.

## Run the development server

```bash
corepack pnpm dev
```

Open the app at:

```text
http://localhost:3000
```

If port `3000` is already in use, Next.js may ask to use another port. Accept it, then open the URL printed in the terminal.

## Production build

To verify the app builds for production:

```bash
corepack pnpm build
```

To run the production server after a successful build:

```bash
corepack pnpm start
```

## Linting

```bash
corepack pnpm lint
```

## Troubleshooting

### `pnpm: command not found`

Use Corepack:

```bash
corepack pnpm install
corepack pnpm dev
```

If Corepack itself is unavailable, install a current Node.js version and try again.

### `ERR_PNPM_IGNORED_BUILDS`

Make sure `pnpm-workspace.yaml` contains:

```yaml
allowBuilds:
  msw: true
  sharp: true
```

Then rerun:

```bash
corepack pnpm install
```

### Dependency warnings about `pnpm.overrides`

pnpm v11 may print a warning that the `pnpm` field in `package.json` is ignored. The app can still run. If you want to remove the warning later, move the override into `pnpm-workspace.yaml` using pnpm's current settings format.

### Clean reinstall

If dependencies are corrupted or the app behaves unexpectedly, remove `node_modules` and reinstall:

```bash
rm -rf node_modules
corepack pnpm install
```
