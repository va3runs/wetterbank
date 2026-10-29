# Wetterbank

**Can a bench start a conversation?** A self-initiated design research project by Varun Sangani on how interactive, autonomous objects in public space shape encounters: between strangers, and between people and the more-than-human city.

**Live:** https://va3runs.github.io/wetterbank/ · **Probe 1 (Take a seat):** https://va3runs.github.io/wetterbank/app/

## What is here

| Path | What it is |
|---|---|
| `index.html` | Research page: questions, background (with sources), method, live results, field notes, origin, FAQ |
| `app/` | **Take a seat**, probe 1: an online encounter at a delayed tram stop with one of five bench behaviours, a short questionnaire and live results. Installable as a web app. |
| `js/encounter.js` | The encounter script and engine: five benches, three strangers, five moments, all lines in English and German |
| `js/sit.js` | The app controller: consent, playback, questionnaire, results |
| `js/collect.js` | Sends anonymous responses to Supabase, only with consent and only when configured |
| `js/config.js` | Supabase URL and public key, study version, threshold for live results |
| `js/wetterbank.js` | Weather (Open-Meteo), weather lines, language switching |
| `css/wb.css` | Design tokens and shared components |
| `supabase/schema.sql` | Database: insert-only tables, aggregate stats function, analysis view |
| `docs/DATA-SETUP.md` | How to switch on data collection (about 10 minutes) |
| `privacy.html` | Participant information, privacy, legal notice |

## Design

- **System:** [kami](https://github.com/nexu-io/open-design/tree/main/design-systems/kami) (after [tw93/kami](https://github.com/tw93/kami), MIT): warm parchment `#f5f4ed`, one ink-blue accent `#1b365d`, serif at a single weight, no bold, no italic, warm greys only, ring and whisper elevation.
- **Feel:** one idea per section, short copy, few links, one main action repeated at the top and bottom.
- **Graphics:** paper-collage illustrations in SVG (grain, a rough coral sun, clouds, concrete, construction lines, an ochre dot), inspired by open-design.ai. Coral and ochre appear only inside artwork, never in the interface.
- No web fonts are loaded (Charter / Georgia / system serif), so no third-party font requests.

## Principles

- No accounts, no cookies, no tracking, no build step. Plain HTML, CSS and JavaScript.
- Nothing is sent unless a participant consents (18+). "Just sit" works fully and sends nothing.
- English by default with an EN / DE switch; the choice is remembered on the device.

## Working on it

- **Edit the encounter:** `js/encounter.js`. Then change `studyVersion` in `js/config.js` so old and new responses stay separable.
- **After any change:** bump `VERSION` in `sw.js` so installed apps update.
- **Test your own runs:** add `?test=1` to the app URL; those sessions are excluded from live results.
- **Force a bench or stranger** (for demos and workshops): `app/?bench=names&stranger=dog`. Benches: `silent`, `weather`, `complaints`, `names`, `morethanhuman`. Strangers: `shopper`, `student`, `dog`.
- **Track where people come from:** add `?src=linkedin` (or any label) to shared links.

```sh
python3 -m http.server 8000   # then open http://localhost:8000
```

## Hosting

GitHub Pages from `main`, folder `/ (root)`. Data: Supabase (Frankfurt), see `docs/DATA-SETUP.md`.
