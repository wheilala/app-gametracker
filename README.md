# Game Tracker

Lightweight mobile-friendly soccer game tracker for fast sideline observations, goals, substitutions, playing time, and game-log export.

## Run

Open `index.html` directly in a browser for basic use.

For install/PWA testing, serve the folder from localhost:

```powershell
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Release Workflow

Use `develop` for ordinary app changes. Merge `develop` into `main` when a change is ready for beta testers.

Pushing to `main` runs `.github/workflows/publish-pages.yml`, which copies the static app into the `app-gametracker/` folder of `wheilala/wheilala.github.io`.

Published URL:

`https://wheilala.github.io/app-gametracker/`

The workflow requires a repository secret named `PAGES_PUBLISH_TOKEN` with permission to push to `wheilala/wheilala.github.io`.

## Notes

- Game data is saved in browser `localStorage`.
- The app is intentionally static: no backend, no build step.
- PWA install support requires `localhost` or HTTPS in most browsers.
