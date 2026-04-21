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

## Supabase Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Copy the project URL and anon/public key into `supabase-config.js`.
4. Keep `enableGoogle` set to `false` until the Google provider is configured in Supabase.

The browser app only uses the public anon key. Row Level Security in `supabase/schema.sql` limits users to their own profile, teams, players, observation choices, and game logs.

## Notes

- Active game data and a local game-log archive are saved in browser `localStorage`.
- Accounts, teams, rosters, curated observation choices, and game logs can sync through Supabase when configured.
- The app is intentionally static: no build step.
- PWA install support requires `localhost` or HTTPS in most browsers.
