/* Configuration for the public consultation.
   Fill in the two Supabase values to start recording votes (see docs/DATA-SETUP.md).
   Both values are safe to publish: the database only accepts new votes and motions,
   and only returns totals and approved motions, never individual rows. */
window.WB_CONFIG = {
  supabaseUrl: "",      // e.g. "https://abcdefghijkl.supabase.co"
  supabaseAnonKey: "",  // the "anon public" key from Project Settings → API
  draft: "0.3",         // raise when the paragraphs change, so old and new votes can be told apart
  decideMinVotes: 15,   // a paragraph needs this many for/against votes before it is adopted or rejected
  adoptAt: 60,          // % in favour (abstentions not counted) to adopt
  rejectAt: 40,         // % in favour at or below which a paragraph is rejected
  showShareAfter: 5     // show the public's split after a vote once a paragraph has this many votes
};
