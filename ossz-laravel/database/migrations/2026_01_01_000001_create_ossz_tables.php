<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
 * Full OSSZ schema ported from src/db/schema.ts (Drizzle / PostgreSQL)
 * onto MySQL. Column names are identical, so data exported from the
 * Next.js database can be imported without renaming.
 */
return new class extends Migration
{
    public function up(): void
    {
        // ── Users & addresses ──────────────────────────────────────────
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('email')->unique();
            $table->string('username')->nullable()->unique();
            $table->string('phone')->nullable();
            $table->string('full_name')->default('');
            $table->string('password_hash');
            $table->string('role')->default('customer'); // customer|uploader|staff|admin
            $table->timestamp('created_at')->nullable();
            $table->index('role');
        });

        Schema::create('addresses', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->string('label')->default('Home');
            $table->string('full_name');
            $table->string('phone');
            $table->string('city')->default('Douala');
            $table->string('area')->default('');
            $table->string('street')->default('');
            $table->string('notes')->default('');
            $table->boolean('is_default')->default(false);
            $table->timestamp('created_at')->nullable();
            $table->index('user_id');
        });

        // ── Catalogue ──────────────────────────────────────────────────
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('name_fr')->default('');
            $table->string('slug')->unique();
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->integer('sort_order')->default(0);
        });

        Schema::create('collections', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('cover_image')->default('');
            $table->string('season')->default('');
            $table->string('name_fr')->default('');
            $table->text('description_fr')->nullable();
            $table->string('season_fr')->default('');
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_published')->default(true);
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->text('details')->nullable();
            $table->text('care_instructions')->nullable();
            $table->string('name_fr')->default('');
            $table->text('description_fr')->nullable();
            $table->text('details_fr')->nullable();
            $table->text('care_instructions_fr')->nullable();
            $table->unsignedBigInteger('category_id')->nullable();
            $table->foreign('category_id')->references('id')->on('categories')->nullOnDelete();
            $table->unsignedBigInteger('collection_id')->nullable();
            $table->foreign('collection_id')->references('id')->on('collections')->nullOnDelete();
            $table->integer('base_price')->default(0); // XAF, no decimals
            $table->boolean('is_published')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->integer('popularity')->default(0);
            $table->string('seo_title')->default('');
            $table->string('seo_description')->default('');
            $table->timestamp('created_at')->nullable();
            $table->index(['category_id', 'collection_id', 'is_published', 'created_at']);
        });

        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('product_id');
            $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete();
            $table->string('size')->default('One size');
            $table->string('colour')->default('Natural');
            $table->string('sku')->default('');
            $table->integer('price_override')->nullable();
            $table->integer('stock_qty')->default(0);
            $table->integer('low_stock_threshold')->default(3);
            $table->index('product_id');
        });

        Schema::create('product_images', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('product_id');
            $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete();
            $table->string('url');
            $table->string('alt_text')->default('');
            $table->integer('sort_order')->default(0);
            $table->index(['product_id', 'sort_order']);
        });

        Schema::create('media', function (Blueprint $table) {
            $table->id();
            $table->string('url');
            $table->string('alt_text')->default('');
            $table->string('tags')->default('');
            $table->unsignedBigInteger('uploaded_by')->nullable();
            $table->foreign('uploaded_by')->references('id')->on('users')->nullOnDelete();
            $table->timestamp('created_at')->nullable();
        });

        // ── Carts & orders ─────────────────────────────────────────────
        Schema::create('carts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->string('session_id')->nullable();
            $table->string('coupon_code')->nullable();
            $table->timestamp('created_at')->nullable();
            $table->index(['user_id', 'session_id']);
        });

        Schema::create('cart_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('cart_id');
            $table->foreign('cart_id')->references('id')->on('carts')->cascadeOnDelete();
            $table->unsignedBigInteger('variant_id');
            $table->foreign('variant_id')->references('id')->on('product_variants')->cascadeOnDelete();
            $table->integer('quantity')->default(1);
            $table->index(['cart_id', 'variant_id']);
        });

        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
            $table->string('guest_email')->default('');
            $table->string('guest_phone')->default('');
            $table->string('customer_name')->default('');
            $table->string('status')->default('placed'); // placed|processing|ready|out_for_delivery|delivered|returned|cancelled
            $table->integer('subtotal')->default(0);
            $table->integer('discount')->default(0);
            $table->integer('delivery_fee')->default(0);
            $table->integer('total')->default(0);
            $table->string('coupon_code')->default('');
            $table->string('payment_method')->default('mobile_money_mtn');
            $table->string('payment_status')->default('pending');
            $table->string('delivery_method')->default('douala_local');
            $table->string('delivery_zone')->default('');
            $table->json('shipping_snapshot')->nullable();
            $table->string('payment_proof_url')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();
            $table->index(['user_id', 'status', 'created_at']);
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('order_id');
            $table->foreign('order_id')->references('id')->on('orders')->cascadeOnDelete();
            $table->unsignedBigInteger('variant_id')->nullable();
            $table->foreign('variant_id')->references('id')->on('product_variants')->nullOnDelete();
            $table->string('product_name');
            $table->string('product_slug')->default('');
            $table->string('variant_label')->default('');
            $table->string('image_url')->default('');
            $table->integer('quantity')->default(1);
            $table->integer('unit_price')->default(0);
            $table->index('order_id');
        });

        // ── Appointments, wishlist, coupons ────────────────────────────
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
            $table->string('guest_name')->default('');
            $table->string('guest_contact')->default('');
            $table->string('service')->default('Styling session');
            $table->timestamp('slot_start');
            $table->timestamp('slot_end');
            $table->string('status')->default('requested'); // requested|confirmed|completed|cancelled
            $table->text('notes')->nullable();
            $table->timestamp('created_at')->nullable();
            $table->index(['slot_start', 'user_id']);
        });

        Schema::create('wishlists', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->unsignedBigInteger('product_id');
            $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete();
            $table->timestamp('created_at')->nullable();
            $table->unique(['user_id', 'product_id']);
        });

        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('type')->default('percentage'); // percentage|fixed|free_delivery
            $table->integer('value')->default(0);
            $table->timestamp('expires_at')->nullable();
            $table->integer('usage_limit')->default(0);
            $table->integer('times_used')->default(0);
            $table->boolean('is_active')->default(true);
        });

        // ── Content ────────────────────────────────────────────────────
        Schema::create('journal_posts', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('excerpt')->nullable();
            $table->text('body')->nullable();
            $table->string('cover_image')->default('');
            $table->string('title_fr')->default('');
            $table->text('excerpt_fr')->nullable();
            $table->text('body_fr')->nullable();
            $table->string('author_name')->default('OSSZ Studio');
            $table->string('status')->default('draft'); // draft|published
            $table->timestamp('published_at')->nullable();
            $table->timestamp('created_at')->nullable();
            $table->index(['status', 'published_at']);
        });

        Schema::create('home_blocks', function (Blueprint $table) {
            $table->id();
            $table->string('type')->default('hero'); // hero|banner|quote|editorial
            $table->string('eyebrow')->default('');
            $table->string('heading')->default('');
            $table->text('body')->nullable();
            $table->string('image_url')->default('');
            $table->string('cta_label')->default('');
            $table->string('eyebrow_fr')->default('');
            $table->string('heading_fr')->default('');
            $table->text('body_fr')->nullable();
            $table->string('cta_label_fr')->default('');
            $table->string('cta_href')->default('/shop');
            $table->integer('sort_order')->default(0);
            $table->boolean('is_published')->default(true);
        });

        Schema::create('lookbook_items', function (Blueprint $table) {
            $table->id();
            $table->string('title')->default('');
            $table->text('caption')->nullable();
            $table->text('caption_fr')->nullable();
            $table->string('image_url');
            $table->string('media_type')->default('image'); // image|video
            $table->string('video_url')->nullable();
            $table->string('poster_url')->nullable();
            $table->integer('duration_seconds')->nullable();
            $table->string('product_slug')->default('');
            $table->integer('sort_order')->default(0);
        });

        Schema::create('faqs', function (Blueprint $table) {
            $table->id();
            $table->string('category')->default('General');
            $table->string('question');
            $table->text('answer');
            $table->string('category_fr')->default('');
            $table->string('question_fr')->default('');
            $table->text('answer_fr')->nullable();
            $table->integer('sort_order')->default(0);
        });

        Schema::create('delivery_zones', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('method')->default('douala_local');
            $table->integer('fee')->default(0);
            $table->string('eta_label')->default('1–2 days');
            $table->string('name_fr')->default('');
            $table->string('eta_label_fr')->default('');
            $table->boolean('is_active')->default(true);
        });

        Schema::create('settings', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->string('value')->default('');
        });

        Schema::create('ai_conversations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
            $table->string('session_id')->default('');
            $table->json('transcript')->nullable();
            $table->boolean('escalated_to_whatsapp')->default(false);
            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();
            $table->index('session_id');
        });

        Schema::create('audit_log', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('actor_id')->nullable();
            $table->foreign('actor_id')->references('id')->on('users')->nullOnDelete();
            $table->string('actor_email')->default('');
            $table->string('action');
            $table->text('detail')->nullable();
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('newsletter_signups', function (Blueprint $table) {
            $table->id();
            $table->string('email')->unique();
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('contact_messages', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('contact');
            $table->text('message');
            $table->boolean('handled')->default(false);
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('ai_gaps', function (Blueprint $table) {
            $table->id();
            $table->string('session_id')->default('');
            $table->string('question');
            $table->string('locale')->default('en');
            $table->string('detected_intent')->default('');
            $table->string('search_performed')->default('');
            $table->text('search_result')->nullable();
            $table->string('reason')->default('');
            $table->text('resolved_answer')->nullable();
            $table->unsignedBigInteger('resolved_by')->nullable();
            $table->foreign('resolved_by')->references('id')->on('users')->nullOnDelete();
            $table->string('status')->default('open'); // open|resolved
            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();
            $table->index('session_id');
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('order_id')->nullable();
            $table->foreign('order_id')->references('id')->on('orders')->cascadeOnDelete();
            $table->unsignedBigInteger('appointment_id')->nullable();
            $table->foreign('appointment_id')->references('id')->on('appointments')->cascadeOnDelete();
            $table->string('channel')->default('email'); // email|whatsapp|sms
            $table->string('recipient')->default('');
            $table->string('subject')->default('');
            $table->text('body')->nullable();
            $table->string('status')->default('queued'); // queued|sent|failed
            $table->string('error')->default('');
            $table->timestamp('created_at')->nullable();
            $table->index(['order_id', 'appointment_id']);
        });

        Schema::create('password_resets', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->string('token')->unique();
            $table->timestamp('expires_at');
            $table->timestamp('used_at')->nullable();
            $table->timestamp('created_at')->nullable();
        });

        // Laravel session storage (config/session.php driver = database).
        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });

        Schema::create('cache', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->mediumText('value');
            $table->integer('expiration');
        });

        Schema::create('cache_locks', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->string('owner');
            $table->integer('expiration');
        });
    }

    public function down(): void
    {
        foreach ([
            'password_resets', 'notifications', 'ai_gaps', 'contact_messages',
            'newsletter_signups', 'audit_log', 'ai_conversations', 'settings',
            'delivery_zones', 'faqs', 'lookbook_items', 'home_blocks',
            'journal_posts', 'coupons', 'wishlists', 'appointments',
            'order_items', 'orders', 'cart_items', 'carts', 'media',
            'product_images', 'product_variants', 'products', 'collections',
            'categories', 'addresses', 'users', 'sessions', 'cache', 'cache_locks',
        ] as $table) {
            Schema::dropIfExists($table);
        }
    }
};
