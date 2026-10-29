# Wetterbank

**Wetterbank is a bench that starts conversations between strangers, by helping them file complaints about the weather.**

A design fiction by Varun Sangani, Düsseldorf, asking how autonomous systems will shape our encounters in public space. The bench doesn't exist. Yet.

**Live:** https://va3runs.github.io/wetterbank/

## Files

| Path | What it is |
|---|---|
| `index.html` | Home: the fiction, the complaint form, three modes, the question |
| `documentation.html` | The research: context, the question, planned field studies, precedents, log, references |
| `css/site.css` | Shared styles |
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
