# OSSZ Collections — Laravel PHP Conversion

## Overview

This is a complete PHP/Laravel 11 conversion of the OSSZ Collections Next.js e-commerce site. The conversion includes:

- **Storefront**: Home, shop, product detail, collections, journal, lookbook, FAQ, size guide, about, contact, appointments, search
- **Cart & Checkout**: Add to cart, coupon codes, checkout with delivery zones and payment methods
- **Auth**: Login, register, password reset, session management
- **Account**: Profile, orders, addresses, wishlist, appointments
- **Admin Backoffice**: Dashboard, orders, products, inventory, collections, coupons, customers, staff, appointments, contact messages, AI gaps, notifications, settings, homepage blocks, journal, lookbook, FAQs, media library
- **Concierge AI**: Gemini-powered chat with product cards and knowledge base fallback
- **i18n**: Full English/French interface support

## Requirements

- PHP 8.2+
- MySQL/MariaDB (or PostgreSQL)
- Composer
- Web server (Apache with mod_rewrite or Nginx)

## Installation

### 1. Upload to Server

Upload the entire `ossz-laravel/` folder to your web server.

### 2. Configure Environment

```bash
cp .env.example .env
php artisan key:generate
```

Edit `.env` with your database credentials:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ossz
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

### 3. Set Up Database

```bash
php artisan migrate
php artisan db:seed
```

This creates all tables and populates them with:
- Staff accounts (admin@osszcollection.com, staff@osszcollection.com, uploader@osszcollection.com)
- Categories and collections
- Sample products
- Delivery zones
- Settings
- Homepage blocks
- FAQs
- Journal posts

### 4. Set Permissions

```bash
chmod -R 775 storage bootstrap/cache
chmod -R 755 public
```

### 5. Configure Web Server

**Apache**: Point DocumentRoot to `public/` folder

**Nginx**:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /path/to/ossz-laravel/public;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

### 6. Cache Configuration (Production)

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## Default Staff Accounts

| Email | Username | Password | Role |
|-------|----------|----------|------|
| admin@osszcollection.com | admin | OsszAdmin2026! | admin |
| staff@osszcollection.com | staff | OsszStaff2026! | staff |
| uploader@osszcollection.com | uploader | OsszUpload2026! | uploader |

## Optional Integrations

### Gemini AI Concierge

Set these in `.env`:
```
GEMINI_API_KEY=your_key
GEMINI_API_KEY2=your_backup_key
```

Without keys, the concierge falls back to the knowledge base.

### Email Notifications

Set these in `.env`:
```
RESEND_API_KEY=your_key
RESEND_FROM="OSSZ Collections <hello@osszcollection.com>"
```

Without keys, emails are queued and visible in the backoffice.

## Key Features

### Product Catalogue

- Products with variants (size, colour, stock)
- Multiple images per product
- Categories and collections
- Full-text search
- Price filters

### Cart & Checkout

- Guest and logged-in carts
- Coupon codes (percentage, fixed, free delivery)
- Delivery zones with fees
- Payment methods: MTN MoMo, Orange Money, Card, Cash on Delivery
- Order confirmation via email and WhatsApp

### Concierge AI

- Gemini-powered conversational assistant
- Product recommendation engine
- Knowledge base with FAQ and delivery info
- Escalation to WhatsApp
- AI gaps logging for staff review

### Admin Backoffice

- Real-time dashboard with stats
- Order management with status updates
- Product CRUD with variants and images
- Inventory tracking with low stock alerts
- Staff role management
- Contact message inbox with reply
- Content management (homepage, journal, lookbook, FAQs)
- Settings editor

## File Structure

```
ossz-laravel/
├── app/
│   ├── Http/
│   │   ├── Controllers/      # All controllers
│   │   └── Middleware/        # Auth middleware
│   ├── Models/               # Eloquent models
│   └── Support/              # Helper classes
├── config/                   # Laravel configs
├── database/
│   ├── migrations/           # Database schema
│   └── seeders/              # Sample data
├── public/                   # Web root
├── resources/
│   └── views/                # Blade templates
├── routes/
│   └── web.php               # All routes
└── storage/                  # Logs, cache
```

## Development

### Run Locally

```bash
composer install
php artisan migrate
php artisan serve
```

### Run Tests

```bash
php artisan test
```

## Notes

- The site uses Tailwind CSS via the compiled `public/css/app.css` file
- The design system matches the original Next.js site exactly
- The concierge uses both Gemini API keys in parallel for fastest response
- Product cards in chat are formatted with `PRODUCT:slug|NAME:x|PRICE:y|STOCK:z|IMG:u`
- Uploaded files go to `storage/app/` and are served via `/media/{path}` route

## Troubleshooting

### Database Connection Error

Check `.env` has correct DB credentials and the database exists.

### 500 Error

Check `storage/logs/laravel.log` for details.

### CSS Not Loading

Run `php artisan storage:link` if using file uploads.

### Route Not Found

Ensure `.htaccess` is in `public/` and mod_rewrite is enabled.

---

Generated with Codebuff 🤖
