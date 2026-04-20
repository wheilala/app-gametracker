# Game Tracker

Lightweight mobile-friendly soccer game tracker for fast sideline observations, goals, substitutions, playing time, and game-log export.

## Run

Open `index.html` directly in a browser for basic use.

For install/PWA testing, serve the folder from localhost:

```powershell
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Notes

- Game data is saved in browser `localStorage`.
- The app is intentionally static: no backend, no build step.
- PWA install support requires `localhost` or HTTPS in most browsers.
