# ShoreSquad

ShoreSquad helps young people rally their crews, track weather, and plan beach cleanups using maps and social features. This repository contains the initial scaffold: `index.html`, `css/styles.css`, `js/app.js`, Live Server config, and `.gitignore`.

## Quick start
- Open the folder in VS Code.
- Install the Live Server extension if you haven't.
- Run Live Server with the default settings (port 5500).

## Project structure
- `index.html` — the app entry (HTML5 boilerplate + sample sections)
- `css/styles.css` — styling, variables, responsive layout
- `js/app.js` — demo interactions (save event, toggles, placeholder map/weather)
- `.vscode/settings.json` — Live Server configuration
- `.gitignore` — common ignores

## Product brief summary
- **Name**: ShoreSquad
- **One-liner**: Rally your crew, track weather, and hit the next beach cleanup with our dope map app!
- **Why it matters**: Mobilize young people to clean beaches by making eco-action social, easy to plan, and fun.

## Color palette (recommendation)
- Primary sea blue: #0077A9 — main brand color (buttons, CTA, links)
- Light sea: #5DB8E8 — accent and highlights
- Deep surf: #004F6B — headings and darker UI elements
- Sand accent: #F6C38A — action highlights & playful accents
- Sand pale: #FFF2E6 — cards and background surfaces

Accessibility tip: Keep contrast >= 4.5:1 for body text; use dark text on pale backgrounds and ensure CTAs are clearly separated.

## JavaScript features (recommended)
- Map integration: Mapbox GL or Leaflet for event and cleanup pins.
- Weather info: OpenWeatherMap / WeatherAPI with caching for rate limits.
- Geolocation: Prompt user to show nearby events.
- Offline support: Service workers to cache assets and fallback to offline content.
- Push notifications: Remind users about upcoming cleanups and weather changes.
- Performance: Debounce scroll/resize, lazy-load map & images, requestIdleCallback for non-critical tasks.
- Web Workers: For heavy computations (large image processing, clustering map markers).
- Accessibility: Use ARIA roles for dynamic content; focus management when opening modals.

## UX design principles
- Make community-first flows: onboarding, short flows to create & join events.
- Visibility: Show next events and weather at the top.
- Progressive Disclosure: Initially show minimal UI, advanced filters available when needed.
- Large tap targets: Mobile-first button sizes and spacing.
- Accessible color contrast and keyboard navigation: test with keyboard and screen readers.
- Micro-interactions: subtle animations for saving/joining to show feedback.
- Social features: easy invite links, share to socials, badges for contributors.

## Next steps
- Add a map provider key and connect to the map in `js/app.js`.
 - A Google Maps iframe is embedded in `index.html` and centered at Pasir Ris (1.381497, 103.955574). Click the next cleanup event in the list to recenter the map on its coordinates.
- Add a weather API key and implement live calls.
- Add authentication or SNS invites for group coordination.
- Create event CRUD for hosts and an admin panel.

Enjoy building ShoreSquad! 💡