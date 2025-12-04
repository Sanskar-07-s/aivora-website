# AIVORA — Demo website (GitHub Pages)

## Quick start (Demo)
1. Put all files in a folder `aivora-website/`.
2. Open `index.html` locally to run demo mode.
   - Demo auth uses browser localStorage. Use any email + password to sign up in demo mode.
3. To publish:
   - Create a GitHub repo (public).
   - Upload all files (Add file → Upload files) or push via Git.
   - In repo Settings → Pages → Deploy from branch → select `main` and `/ (root)`.
   - Your site URL will be `https://<username>.github.io/<repo>/`.

## To enable Supabase auth & DB
1. Create a Supabase project: https://supabase.com
2. Copy Project URL and anon public key, paste into `app.js` (SUPABASE_URL, SUPABASE_ANON_KEY).
3. Optional: create `roadmaps` table and update functions to use Supabase (see comments).

## To enable richer AI (HuggingFace)
1. Create HF token: https://huggingface.co/settings/tokens
2. Put token into `app.js` as HF_API_KEY. The AI page will call the model endpoint.

## Production notes
- Replace mailto SOS with an API (Twilio or server) for real alerts.
- Always secure your API keys (do not publish server secrets on client-side).
- Use server-side code for sensitive workflows.

## Need help?
Reply here and I can:
- Prepare a GitHub repo structure and commit files for you,
- Provide exact Supabase SQL for tables,
- Add Twilio demo wiring (server snippet).
