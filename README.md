# Daily Work Tracker (Vercel + Neon)

## 1. Create the database (Neon)
1. Sign in at https://neon.tech and create a project.
2. Click **Connect** and copy the connection string (it starts with `postgresql://`).
3. Optional: paste `schema.sql` into Neon's SQL Editor and run it. The API also creates the table automatically on first use.

## 2. Deploy (Vercel)
1. Put this folder in a GitHub repository, or run `npx vercel` inside the folder.
2. In Vercel choose **Add New → Project** and import the repository. Leave the Framework Preset as **Other**.
3. Add Environment Variables:
   - `DATABASE_URL` = your Neon connection string
   - `APP_PASSWORD` = a password you choose (anyone opening the app must enter it once per device)
4. Click **Deploy**. Your app is live at the `.vercel.app` address.

Tip: Vercel's Marketplace has a Neon integration that adds `DATABASE_URL` for you.

## Files
- `public/index.html` – the app screen
- `api/tickets.js` – the API (list, add, change status, delete)
- `schema.sql` – the table definition
