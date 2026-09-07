# Publish OSSZ Collections — no-code guide

This version is self-contained: even if the downloaded ZIP does not visibly show
product photos, the project includes `scripts/catalogue-images.json`, a text
archive of every catalogue picture. During Vercel build, `npm run prebuild`
restores `public/catalogue` automatically.

So the ZIP being around a few MB is OK. The important files are:

- `src/`
- `public/`
- `scripts/catalogue-images.json`
- `scripts/restore-catalogue-images.mjs`
- `package.json`
- `vercel.json`

## Clean restart on GitHub

If previous GitHub/Vercel attempts are confusing, delete the old GitHub repos and
old Vercel projects, then do this from scratch.

### 1. Download and unzip

Click **Download** in the builder. Unzip the folder.

Inside it you should see `src`, `public`, `scripts`, `package.json`, etc.

The pictures may not appear inside `public/catalogue` yet. That is OK. They are
stored inside:

```text
scripts/catalogue-images.json
```

### 2. Publish using GitHub Desktop

1. Open GitHub Desktop.
2. File → Add Local Repository…
3. Choose the newly unzipped folder.
4. If prompted, click **create a repository**.
5. Commit everything.
6. Click **Publish repository**.

Do not use GitHub browser drag-and-drop for this project.

### 3. Deploy on Vercel

1. Go to Vercel → Add New → Project.
2. Import the GitHub repo.
3. Add environment variables:

```text
DATABASE_URL = your Neon postgresql://... connection string
SESSION_SECRET = any long random string, 40+ characters
```

4. Deploy.

Vercel will run:

```text
npm run prebuild
npm run build
```

The prebuild step restores all product images automatically.

### 4. If products do not appear

Open:

```text
https://YOUR-SITE.vercel.app/api/setup
```

You want to see:

```json
{"ok":true,"before":0,"after":12}
```

Then open:

```text
https://YOUR-SITE.vercel.app/shop
```

### 5. If product names appear but pictures do not

Test this URL:

```text
https://YOUR-SITE.vercel.app/catalogue/ivory-occasion-gown-1.jpg
```

If it opens an image, the pictures are available and the shop should show them
after refresh.

If it shows 404, your GitHub repo does not contain the latest fix. Confirm these
files exist on GitHub:

```text
scripts/catalogue-images.json
scripts/restore-catalogue-images.mjs
src/app/catalogue/[file]/route.ts
```

Then redeploy.

## After launch

Sign in at `/login` with:

```text
admin / admin
```

Then change the default passwords under Settings → Staff & roles.
