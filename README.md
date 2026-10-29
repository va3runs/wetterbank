# Wetterbank®

*Die Bank, die immer etwas zu sagen hat.* The bench that always has something to say.

Wetterbank is a design fiction by Varun Sangani: a fictional smart bench from Düsseldorf that starts conversations between strangers. It opens with the weather, takes complaints about it, and then asks for your name. Wetterbank GmbH, "founded 2031 after a 40-minute tram delay in which nobody said a word", does not exist.

**Live:** https://va3runs.github.io/wetterbank/ · **App:** https://va3runs.github.io/wetterbank/app/

## What is here

| Path | What it is |
|---|---|
| `index.html` | Product site of the fictional Wetterbank GmbH, with a live line from the bench based on Düsseldorf's current weather |
| `app/` | The installable web app: **Heute** (today's weather as a first sentence) and **Sag's dem Wetter** (file a complaint, get a case number) |
| `js/wetterbank.js` | All bench lines (German + English) and the weather logic. Edit lines here. |
| `css/wb.css` | Shared colours, buttons, speech bubble |
| `impressum.html` | Impressum and Datenschutz |
| `manifest.webmanifest`, `sw.js` | Makes the app installable and lets it work offline |
| `assets/` | Icons (SVG, PNG, maskable) |

## Principles

- No accounts, no cookies, no tracking, no build step. Plain HTML, CSS and JavaScript.
- Nothing typed is sent or stored. The only outside request is the weather from [Open-Meteo](https://open-meteo.com/) (free, no key, CC BY 4.0).
- System fonts only, so no Google Fonts request.
- "Vorlesen" (read aloud) appears only when the device has an on-device German voice.
- German first, English gloss underneath.

## Editing the bench's lines

Open `js/wetterbank.js`:
- `REPLIES`: the 21 complaint replies
- `WEATHER_REPLIES`: complaint replies that use today's weather
- `OPENERS`: first sentences per weather condition (`clear`, `night`, `partly`, `overcast`, `fog`, `drizzle`, `rain`, `snow`, `thunder`, `unknown`)
- `EXTRAS`: optional second sentences (wind, feels-colder, cold bench, heat)

Placeholders: `{t}` temperature, `{f}` feels-like, `{w}` wind km/h, `{c}` / `{c_en}` condition, `{city}`.

After changing files, bump `VERSION` in `sw.js` (e.g. `wb-v2`) so installed apps pick up the update.

## Run locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Hosting

GitHub Pages: Settings → Pages → Source: *Deploy from a branch*, Branch: `main`, folder `/ (root)`.
