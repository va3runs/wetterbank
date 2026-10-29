# Switching on the consultation (about 10 minutes)

Until you do this, the site runs in **preview mode**: people can vote and file motions, but nothing is recorded, and the page says so.

## 1. Create the database

1. Go to [supabase.com](https://supabase.com) and sign up (free plan).
2. **New project** → name `bench-code` → choose a strong database password (save it in your password manager) → **Region: Central EU (Frankfurt)** → Create.
3. Wait a minute until the project is ready.

## 2. Create the tables

1. Left sidebar → **SQL Editor** → **New query**.
2. Open `supabase/schema.sql` from this repo, copy everything, paste it in, press **Run**. It should say *Success. No rows returned.*

## 3. Connect the website

1. Left sidebar → **Project Settings** → **API** (or **Data API**).
2. Copy the **Project URL** and the **anon public** key. Never use the `service_role` key on the website.
3. Paste them into `js/config.js` (or send them to Claude to push):

```js
supabaseUrl: "https://xxxxxxxx.supabase.co",
supabaseAnonKey: "eyJ...",
```

## 4. Test it

1. Open `https://va3runs.github.io/wetterbank/?test=1`. The `?test=1` marks your own votes, so they never count in the draft.
2. Vote on a few paragraphs and file a test motion.
3. In Supabase → **Table Editor**, you should see rows in `bc_votes` and `bc_motions`.

## Approving motions (your job as minute-taker)

New motions are hidden until you approve them.

1. Supabase → **Table Editor** → `bc_motions`.
2. For a motion you want to put to the vote: set `approved` to `true`. Optionally fill `body_en` and `body_de` with a cleaned-up translation, so it reads well in both languages (otherwise the original text is shown in both).
3. Offensive, personal or duplicate motions: delete the row.

Approved motions appear in the draft under their section, marked "Motion from the public", and are put to the vote in the hearing.

## Looking at the results

- **Live:** the draft on the website shows each paragraph's status.
- **SQL Editor:**
  - Totals per paragraph: `select clause, vote, count(*) from bc_flat where not is_test group by 1,2 order by 1,2;`
  - Where people came from: `select source, referrer, count(distinct session) from bc_flat where not is_test group by 1,2 order by 3 desc;`
  - All motions: `select created_at, section, body, approved from bc_motions order by created_at desc;`
- **Export:** run a query, then **Download CSV** (opens in Excel, Numbers or Google Sheets).

## Good to know

- **Free plan pauses** a project after about a week with no activity. If that happens, open the dashboard and press *Restore*. While paused, the site still works but records nothing.
- **Tag your links:** add `?src=linkedin` (or `?src=poster`, `?src=fft`) to links you share. It ends up in the `source` column.
- **Changing paragraphs:** if you reword a paragraph in `js/code.js`, raise `draft` in `js/config.js` (e.g. `"0.4"`), so old and new votes can be told apart. Don't reuse an ID like `s3.3` for a different paragraph; give new ones new IDs.
- **Thresholds:** `decideMinVotes`, `adoptAt` and `rejectAt` in `js/config.js` decide when a paragraph is adopted or rejected.
- **Spam:** the database only accepts well-formed, size-limited rows, one vote per paragraph per session, but there is no rate limit. If someone floods it, filter by `created_at`, or temporarily drop the insert policy.
- **Privacy:** with the Frankfurt region, data stays in the EU. Supabase offers a data processing agreement; see [supabase.com/legal/dpa](https://supabase.com/legal/dpa).
