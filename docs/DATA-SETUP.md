# Switching on data collection (about 10 minutes)

Until you do this, the site runs in **preview mode**: everything works, nothing is stored, and the intro says so.

## 1. Create the database

1. Go to [supabase.com](https://supabase.com) and sign up (free plan).
2. **New project** → name `wetterbank` → choose a strong database password (save it in your password manager) → **Region: Central EU (Frankfurt)** → Create.
3. Wait a minute until the project is ready.

## 2. Create the tables

1. Left sidebar → **SQL Editor** → **New query**.
2. Open `supabase/schema.sql` from this repo, copy everything, paste it in, press **Run**. It should say *Success. No rows returned.*

## 3. Connect the website

1. Left sidebar → **Project Settings** → **API** (or **Data API**).
2. Copy the **Project URL** and the **anon public** key. (Never use the `service_role` key on the website.)
3. In this repo, open `js/config.js` and paste them:

```js
supabaseUrl: "https://xxxxxxxx.supabase.co",
supabaseAnonKey: "eyJ...",
```

4. Commit and push (or ask Claude to). GitHub Pages updates in a minute or two.

## 4. Test it

1. Open `https://va3runs.github.io/wetterbank/app/?test=1`. The `?test=1` marks your own runs, so they are left out of the live results.
2. Tick the box, sit down, finish an encounter and the questions.
3. In Supabase → **Table Editor** → `wb_sessions` and `wb_results`: your row should be there.

## Looking at the data

- **SQL Editor:** `select * from wb_flat where not is_test order by created_at desc;`
- **Export:** run the query, then **Download CSV**. It opens in Excel, Numbers or Google Sheets.
- Useful first questions:
  - `select bench, result, count(*) from wb_flat where finished and not is_test group by 1,2 order by 1,2;`
  - `select bench, round(avg(easier),2), round(avg(intrusive),2), count(*) from wb_flat where finished and not is_test group by 1;`
  - `select bench, first_contact_via, count(*) from wb_flat where finished and not is_test group by 1,2;`
  - `select open_text from wb_flat where open_text is not null;`

## Deleting someone's answers

People get an 8-character participation code at the end. If someone emails you theirs:

```sql
delete from wb_sessions where left(id::text, 8) = 'abcd1234';
```

(This also deletes their results.)

## Good to know

- **Free plan pauses** a project after about a week with no activity. If that happens, open the Supabase dashboard and press *Restore*. While paused, the site still works but stores nothing.
- **Sharing links per channel:** add `?src=linkedin` (or `?src=instagram`, `?src=poster`) to the link you share. It ends up in the `source` column, so you can see where people came from.
- **Changing the script:** if you change the encounter text in `js/encounter.js`, also change `studyVersion` in `js/config.js`, so old and new responses can be told apart.
- **Spam:** the database only accepts well-formed, size-limited rows, but there is no rate limit. If someone floods it, filter by `created_at` or temporarily remove the anon insert policy.
- **Privacy:** with the Frankfurt region, the data stays in the EU. Supabase offers a data processing agreement (DPA); see [supabase.com/legal/dpa](https://supabase.com/legal/dpa) and sign it for your organisation. The database itself does not store IP addresses, but Supabase keeps short-lived request logs.
