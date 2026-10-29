# The Bench Code

**Before benches start talking, someone has to set the rules.**

A public consultation on the *Code of Conduct for Talking Street Furniture*, drafted by the (fictional) Council for Talking Street Furniture: Bench No. 0417 (chair), a plane tree, a pigeon, the weather (advisory, not reachable) and the public. Visitors vote on each paragraph and can file motions for new ones. The draft updates live and prints as an A4 document.

A design research project by Varun Sangani, grown out of the earlier design fiction *Wetterbank*. The votes show which behaviours people accept from talking objects in public space, and where friendly turns into nosy. The finished code is meant to be performed by actors at a staged tram stop.

**Live:** https://va3runs.github.io/wetterbank/

## Files

| Path | What it is |
|---|---|
| `index.html` | The whole consultation: hero, hearing, live draft, motions, council, why |
| `js/code.js` | **The Code itself**: preamble, sections, the 23 votable paragraphs, council comments, members (EN/DE) |
| `js/consult.js` | Page logic: hearing sessions, live draft, motions, printing |
| `js/tally.js` | Sends votes and motions to Supabase and loads totals; does nothing in preview mode |
| `js/config.js` | Supabase URL and public key, draft number, adoption thresholds |
| `js/lang.js` | EN / DE switch |
| `css/wb.css` | Design tokens (kami) and shared components |
| `supabase/schema.sql` | Database: insert-only tables, motion approval, `bc_tally()` totals |
| `docs/DATA-SETUP.md` | Switching on the database, approving motions, reading results |
| `privacy.html` | How votes are used, privacy, legal notice |
| `app/` | Redirect from the old Wetterbank app link |

## Editing the Code

All text lives in `js/code.js` as `{en, de}` pairs. Each votable paragraph has an ID (`s3.3` = section 3, paragraph 3) and a comment from a council member (`bench`, `tree`, `pigeon`, `weather`, or `minutes` for a serious note). If you change wording, raise `draft` in `js/config.js`; for a new paragraph, use a new ID.

After any change, bump `VERSION` in `sw.js` so installed copies update.

## Design

- **System:** [kami](https://github.com/nexu-io/open-design/tree/main/design-systems/kami) (after [tw93/kami](https://github.com/tw93/kami), MIT): parchment, one ink-blue accent, serif at one weight, no bold or italic, warm greys, ring and whisper elevation. The site is literally a printed document, so kami fits.
- **Feel:** one idea per section, few links, one main action (vote).
- **Graphics:** a paper-collage illustration of the council in session (SVG; grain, coral sun, concrete, clouds, construction lines), inspired by open-design.ai. Coral and ochre live only inside artwork.
- No web fonts, no cookies, no third-party scripts.

## Run locally

```sh
python3 -m http.server 8000   # then open http://localhost:8000
```

Add `?test=1` to mark your own votes as tests.
