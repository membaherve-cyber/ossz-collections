#!/bin/bash
# OSSZ Collections - Namecheap Deployment Script
# Run this from your local machine after extracting the Laravel project

echo "=========================================="
echo "  OSSZ Collections - Namecheap Deployer  "
echo "=========================================="

# Configuration
CPANEL_URL="https://osszcollection.com:2083"
CPANEL_USER="YOUR_CPANEL_USERNAME"
DOMAIN="osszcollection.com"

echo ""
echo "This script will guide you through deploying to Namecheap."
echo "You'll need to perform some steps manually in cPanel."
echo ""

# Step 1: Create deployment ZIP
echo "[1/6] Creating deployment ZIP file..."
cd "$(dirname "$0")"
zip -r ossz-laravel-deploy.zip . -x "*.git*" "node_modules/*" ".env" "storage/logs/*" "bootstrap/cache/*"
echo "✓ Created ossz-laravel-deploy.zip"
echo ""

# Step 2: Instructions for cPanel
echo "[2/6] DEPLOYMENT INSTRUCTIONS"
echo "=========================================="
echo ""
echo "1. LOG INTO cPanel:"
echo "   URL: $CPANEL_URL"
echo "   Username: $CPANEL_USER"
echo ""
echo "2. UPLOAD FILES:"
echo "   - Go to File Manager"
echo "   - Navigate to public_html/"
echo "   - Upload 'ossz-laravel-deploy.zip'"
echo "   - Extract the ZIP file in public_html/"
echo "   - Move ALL files from the extracted folder to public_html/"
echo "   - Delete the ZIP and empty folder"
echo ""
echo "3. SET DOCUMENT ROOT:"
echo "   - Go to Domains → Manage $DOMAIN"
echo "   - Set Document Root to: public_html/public"
echo ""
echo "4. CREATE DATABASE:"
echo "   - Go to PostgreSQL Databases"
echo "   - Create database: osszcollection_laravel"
echo "   - Create user: osszcollection_user"
echo "   - Set password: (generate strong password)"
echo "   - Add user to database with ALL PRIVILEGES"
echo ""
echo "5. EDIT .env FILE:"
echo "   - Open public_html/.env in File Manager"
echo "   - Update database credentials:"
echo "     DB_HOST=localhost"
echo "     DB_PORT=5432"
echo "     DB_DATABASE=osszcollection_laravel"
echo "     DB_USERNAME=osszcollection_user"
echo "     DB_PASSWORD=your_password_here"
echo "     APP_URL=https://osszcollection.com"
echo ""
echo "6. RUN ARTISAN COMMANDS:"
echo "   - Go to Terminal in cPanel (or use SSH)"
echo "   - Run these commands:"
echo "     cd ~/public_html"
echo "     php artisan key:generate"
echo "     php artisan migrate --force"
echo "     php artisan db:seed --force"
echo "     php artisan config:cache"
echo "     php artisan route:cache"
echo "     php artisan view:cache"
echo "     chmod -R 775 storage bootstrap/cache"
echo ""
echo "7. SETUP SSL:"
echo "   - Go to SSL/TLS Status"
echo "   - Click Run AutoSSL for $DOMAIN"
echo ""
echo "8. SETUP CRON JOB:"
echo "   - Go to Cron Jobs"
echo "   - Add: * * * * * cd ~/public_html && php artisan schedule:run >> /dev/null 2>&1"
echo ""
echo "=========================================="
echo "  Default Login: admin@osszcollection.com"
echo "  Password: password (CHANGE AFTER FIRST LOGIN)"
echo "=========================================="
echo ""

# Step 3: Generate .env content
echo "[3/6] Generating .env file for production..."
cat > .env.production << 'EOF'
APP_NAME="OSSZ Collections"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://osszcollection.com

LOG_CHANNEL=stack
LOG_LEVEL=error

DB_CONNECTION=pgsql
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=osszcollection_laravel
DB_USERNAME=osszcollection_user
DB_PASSWORD=YOUR_PASSWORD_HERE

SESSION_DRIVER=database
SESSION_LIFETIME=120

CACHE_STORE=database

GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
GEMINI_API_KEY2=YOUR_SECOND_API_KEY_HERE

WHATSAPP_NUMBER=+YOUR_WHATSAPP_NUMBER
CONTACT_EMAIL=info@osszcollection.com
EOF
echo "✓ Created .env.production template"
echo ""

# Step 4: Create quick deploy instructions
echo "[4/6] Creating quick reference card..."
cat > QUICK-DEPLOY.txt << 'EOF'
╔════════════════════════════════════════════════════════════╗
║         OSSZ COLLECTIONS - NAMECHEAP QUICK DEPLOY         ║
╚════════════════════════════════════════════════════════════╝

STEP 1: Upload
─────────────
• Login to cPanel: https://osszcollection.com:2083
• Open File Manager → public_html/
• Upload ossz-laravel-deploy.zip
• Extract ZIP → Move files to public_html root

STEP 2: Database
────────────────
• PostgreSQL Databases → Create:
  - Database: osszcollection_laravel
  - User: osszcollection_user  
  - Password: (your choice)
  - Grant ALL PRIVILEGES

STEP 3: Configure
─────────────────
• Edit public_html/.env with your database credentials
• Set Document Root to: public_html/public

STEP 4: Finalize
────────────────
• Terminal → cd ~/public_html
• php artisan key:generate
• php artisan migrate --force
• php artisan db:seed --force
• php artisan config:cache
• chmod -R 775 storage bootstrap/cache

STEP 5: SSL & Go Live
─────────────────────
• SSL/TLS → Run AutoSSL
• Visit https://osszcollection.com

Login: admin@osszcollection.com / password
EOF
echo "✓ Created QUICK-DEPLOY.txt"
echo ""

echo "[5/6] Files ready for deployment:"
echo "  • ossz-laravel-deploy.zip (upload this to cPanel)"
echo "  • .env.production (template for .env)"
echo "  • QUICK-DEPLOY.txt (step-by-step reference)"
echo ""

echo "[6/6] DEPLOYMENT COMPLETE!"
echo "=========================================="
echo "Open QUICK-DEPLOY.txt for the full checklist."
echo "=========================================="
