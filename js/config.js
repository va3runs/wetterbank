/* Wetterbank research site: configuration.
   Fill in the two Supabase values to start collecting responses.
   See docs/DATA-SETUP.md. Both values are safe to publish: the database only
   accepts inserts and returns aggregate numbers, never individual rows. */
window.WB_CONFIG = {
  supabaseUrl: "",      // e.g. "https://abcdefghijkl.supabase.co"
  supabaseAnonKey: "",  // the "anon public" key from Project Settings → API
  studyVersion: "2026-11-a", // change when the encounter script changes, so results stay comparable
  minResultsToShow: 20  // live results stay hidden until this many people have taken part
};
