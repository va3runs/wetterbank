# Wetterbank

**Wetterbank is a bench that says the first sentence.** It opens with the weather, takes complaints, and ends with your name. For tram stops where nobody talks.

A design fiction by Varun Sangani, Düsseldorf. The bench doesn't exist.

**Live:** https://va3runs.github.io/wetterbank/

## Files

| Path | What it is |
|---|---|
| `index.html` | The whole site: one page, styles and the complaint demo inline |
| `privacy.html` | Privacy and imprint |
| `404.html` | Not-found page |
| `assets/` | Icon and sharing image |
| `sw.js` | Retires the service worker from earlier versions, so returning visitors get this page |
| `app/` | Redirect from an old link |

No build step, no frameworks, no cookies, no tracking, nothing sent anywhere.

## Run locally

```sh
python3 -m http.server 8000   # then open http://localhost:8000
```
