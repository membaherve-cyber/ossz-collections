# OSSZ Collections Laravel - Deployment Guide for Namecheap

## Prerequisites
- Namecheap hosting with cPanel access
- PHP 8.2+ support
- PostgreSQL database (Neon)
- Composer installed locally

## Step 1: Prepare the Application Locally

```bash
# Install dependencies
composer install --optimize-autoloader --no-dev

# Generate application key
php artisan key:generate

# Run migrations
php artisan migrate

# Seed the database
php artisan db:seed

# Cache configuration
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## Step 2: Upload Files to Namecheap

1. Log into cPanel at osszcollection.com
2. Open **File Manager**
3. Navigate to `public_html/`
4. Upload the entire `ossz-laravel` folder contents

**Important:** Upload these folders/files to `public_html/`:
- `app/` - Application logic
- `bootstrap/` - Framework bootstrap
- `config/` - Configuration
- `database/` - Migrations and seeders
- `public/` - Public assets (this becomes your web root)
- `resources/` - Views and assets
- `routes/` - Route definitions
- `storage/` - Logs, cache, sessions
- `vendor/` - Composer dependencies
- `.env` - Environment configuration
- `artisan` - CLI entry point
- `composer.json`
- `composer.lock`

## Step 3: Configure cPanel

### Set Document Root
1. In cPanel, go to **Domains**
2. Click **Manage** next to `osszcollection.com`
3. Set Document Root to: `public_html/public`

### Set PHP Version
1. Go to **Select PHP Version**
2. Choose PHP 8.2 or higher
3. Enable these extensions:
   - `pgsql`
   - `pdo_pgsql`
   - `mbstring`
   - `openssl`
   - `tokenizer`
   - `xml`
   - `ctype`
   - `json`
   - `curl`

## Step 4: Configure .env

Edit `public_html/.env`:

```env
APP_NAME="OSSZ Collections"
APP_ENV=production
APP_KEY=base64:YOUR_GENERATED_KEY
APP_DEBUG=false
APP_URL=https://osszcollection.com

LOG_CHANNEL=stack
LOG_LEVEL=error

DB_CONNECTION=pgsql
DB_HOST=ep-shiny-smoke-asvvjgmv-pooler.c-4.eu-central-1.aws.neon.tech
DB_PORT=5432
DB_DATABASE=la%20maison%20bibi
DB_USERNAME=neondb_owner
DB_PASSWORD=YOUR_NEON_PASSWORD

SESSION_DRIVER=database
SESSION_LIFETIME=120

CACHE_STORE=database

GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
GEMINI_API_KEY2=YOUR_SECOND_API_KEY_HERE

WHATSAPP_NUMBER=+YOUR_WHATSAPP_NUMBER
CONTACT_EMAIL=info@osszcollection.com
```

## Step 5: Set Permissions

In cPanel File Manager, set these permissions:
- `storage/` - 775 (recursive)
- `bootstrap/cache/` - 775 (recursive)
- `public/` - 755
- All other folders - 755

## Step 6: Run Artisan via SSH

1. Go to **Terminal** in cPanel (or use SSH)
2. Navigate to the app directory:
```bash
cd ~/public_html
```

3. Run artisan commands:
```bash
php artisan migrate --force
php artisan db:seed --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## Step 7: SSL Certificate

Namecheap provides free SSL with hosting:
1. Go to **SSL/TLS Status** in cPanel
2. Click **Run AutoSSL** for osszcollection.com

## Step 8: Cron Jobs

Go to **Cron Jobs** in cPanel and add:

```
* * * * * cd /home/osszcollection/public_html && php artisan schedule:run >> /dev/null 2>&1
```

## Step 9: Verify Deployment

Visit:
- https://osszcollection.com - Public shop
- https://osszcollection.com/admin - Backoffice (login required)

Default credentials (change after first login):
- Email: admin@osszcollection.com
- Password: password

## Troubleshooting

### 500 Error
- Check `.env` has valid `APP_KEY`
- Verify `storage/` is writable
- Check `storage/logs/laravel.log`

### Database Connection
- Verify Neon database credentials
- Ensure PostgreSQL extension is enabled in PHP

### Routes Not Working
- Verify `.htaccess` is in `public/` folder
- Check mod_rewrite is enabled

### Session Issues
- Ensure `sessions` table exists (run migrations)
- Check `storage/` permissions

## Post-Deployment Checklist

- [ ] Change default admin password
- [ ] Update `APP_URL` to production
- [ ] Set `APP_DEBUG=false`
- [ ] Verify SSL is working
- [ ] Test all pages
- [ ] Test checkout flow
- [ ] Test concierge chatbot
- [ ] Test order tracking
- [ ] Test email notifications
- [ ] Set up monitoring

---

Generated with Codebuff 🤖
