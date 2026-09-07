<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── People & access ──────────────────────────────────────────────
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('email')->unique();
            $table->string('username')->nullable()->unique();
            $table->string('phone')->nullable();
            $table->string('full_name')->default('');
            $table->string('password_hash');
            $table->string('role')->default('customer'); // customer|uploader|staff|admin
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('label')->default('Home');
            $table->string('full_name');
            $table->string('phone');
            $table->string('city')->default('Douala');
            $table->string('area')->default('');
            $table->string('street')->default('');
            $table->text('notes')->default('');
            $table->boolean('is_default')->default(false);
            $table->timestamp('created_at')->useCurrent();
            $table->index('user_id');
        });

        // ── Catalogue ────────────────────────────────────────────────────
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
            $table->text('description')->default('');
            $table->string('cover_image')->default('');
            $table->string('season')->default('');
            $table->string('name_fr')->default('');
            $table->text('description_fr')->default('');
            $table->string('season_fr')->default('');
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_published')->default(true);
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->default('');
            $table->text('details')->default('');
            $table->text('care_instructions')->default('');
            $table->string('name_fr')->default('');
            $table->text('description_fr')->default('');
            $table->text('details_fr')->default('');
            $table->text('care_instructions_fr')->default('');
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('collection_id')->nullable()->constrained()->nullOnDelete();
            $table->integer('base_price')->default(0);
            $table->boolean('is_published')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->integer('popularity')->default(0);
            $table->string('seo_title')->default('');
            $table->text('seo_description')->default('');
            $table->timestamp('created_at')->useCurrent();
            $table->index('category_id');
            $table->index('collection_id');
            $table->index('is_published');
            $table->index('created_at');
        });

        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
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
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
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
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('created_at')->useCurrent();
        });

        // ── Cart & orders ────────────────────────────────────────────────
        Schema::create('carts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('session_id')->nullable();
            $table->string('coupon_code')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->index('user_id');
            $table->index('session_id');
        });

        Schema::create('cart_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cart_id')->constrained()->cascadeOnDelete();
            $table->foreignId('variant_id')->constrained('product_variants')->cascadeOnDelete();
            $table->integer('quantity')->default(1);
            $table->index('cart_id');
            $table->index('variant_id');
        });

        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('guest_email')->default('');
            $table->string('guest_phone')->default('');
            $table->string('customer_name')->default('');
            $table->string('status')->default('placed');
            $table->integer('subtotal')->default(0);
            $table->integer('discount')->default(0);
            $table->integer('delivery_fee')->default(0);
            $table->integer('total')->default(0);
            $table->string('coupon_code')->default('');
            $table->string('payment_method')->default('mobile_money_mtn');
            $table->string('payment_status')->default('pending');
            $table->string('delivery_method')->default('national');
            $table->string('delivery_zone')->default('');
            $table->json('shipping_snapshot')->nullable();
            $table->text('notes')->default('');
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();
            $table->index('user_id');
            $table->index('status');
            $table->index('created_at');
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('variant_id')->nullable()->constrained('product_variants')->nullOnDelete();
            $table->string('product_name');
            $table->string('product_slug')->default('');
            $table->string('variant_label')->default('');
            $table->string('image_url')->default('');
            $table->integer('quantity')->default(1);
            $table->integer('unit_price')->default(0);
            $table->index('order_id');
        });

        // ── Appointments, wishlist, coupons ──────────────────────────────
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('guest_name')->default('');
            $table->string('guest_contact')->default('');
            $table->string('service')->default('Styling session');
            $table->timestamp('slot_start');
            $table->timestamp('slot_end');
            $table->string('status')->default('requested');
            $table->text('notes')->default('');
            $table->timestamp('created_at')->useCurrent();
            $table->index('slot_start');
            $table->index('user_id');
        });

        Schema::create('wishlists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->timestamp('created_at')->useCurrent();
            $table->unique(['user_id', 'product_id']);
        });

        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('type')->default('percentage');
            $table->integer('value')->default(0);
            $table->timestamp('expires_at')->nullable();
            $table->integer('usage_limit')->default(0);
            $table->integer('times_used')->default(0);
            $table->boolean('is_active')->default(true);
        });

        // ── Content ──────────────────────────────────────────────────────
        Schema::create('journal_posts', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('excerpt')->default('');
            $table->longText('body')->default('');
            $table->string('cover_image')->default('');
            $table->string('title_fr')->default('');
            $table->text('excerpt_fr')->default('');
            $table->longText('body_fr')->default('');
            $table->string('author_name')->default('OSSZ Studio');
            $table->string('status')->default('draft');
            $table->timestamp('published_at')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->index(['status', 'published_at']);
        });

        Schema::create('home_blocks', function (Blueprint $table) {
            $table->id();
            $table->string('type')->default('hero');
            $table->string('eyebrow')->default('');
            $table->string('heading')->default('');
            $table->text('body')->default('');
            $table->string('image_url')->default('');
            $table->string('cta_label')->default('');
            $table->string('eyebrow_fr')->default('');
            $table->string('heading_fr')->default('');
            $table->text('body_fr')->default('');
            $table->string('cta_label_fr')->default('');
            $table->string('cta_href')->default('/shop');
            $table->integer('sort_order')->default(0);
            $table->boolean('is_published')->default(true);
        });

        Schema::create('lookbook_items', function (Blueprint $table) {
            $table->id();
            $table->string('title')->default('');
            $table->text('caption')->default('');
            $table->text('caption_fr')->default('');
            $table->string('image_url');
            $table->string('product_slug')->default('');
            $table->integer('sort_order')->default(0);
        });

        Schema::create('faqs', function (Blueprint $table) {
            $table->id();
            $table->string('category')->default('General');
            $table->text('question');
            $table->longText('answer');
            $table->string('category_fr')->default('');
            $table->text('question_fr')->default('');
            $table->longText('answer_fr')->default('');
            $table->integer('sort_order')->default(0);
        });

        Schema::create('delivery_zones', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('method')->default('national');
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

        // ── AI & notifications ───────────────────────────────────────────
        Schema::create('ai_conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('session_id')->default('');
            $table->json('transcript')->nullable();
            $table->boolean('escalated_to_whatsapp')->default(false);
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();
            $table->index('session_id');
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('appointment_id')->nullable()->constrained('appointments')->cascadeOnDelete();
            $table->string('channel')->default('email');
            $table->string('recipient')->default('');
            $table->string('subject')->default('');
            $table->text('body')->default('');
            $table->string('status')->default('queued');
            $table->text('error')->default('');
            $table->timestamp('created_at')->useCurrent();
        });

        // ── Audit & misc ─────────────────────────────────────────────────
        Schema::create('audit_log', function (Blueprint $table) {
            $table->id();
            $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('actor_email')->default('');
            $table->string('action');
            $table->text('detail')->default('');
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('newsletter_signups', function (Blueprint $table) {
            $table->id();
            $table->string('email')->unique();
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('contact_messages', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('contact');
            $table->text('message');
            $table->boolean('handled')->default(false);
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('password_resets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('token')->unique();
            $table->timestamp('expires_at');
            $table->timestamp('used_at')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        // ── Session table (for database driver) ──────────────────────────
        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_resets');
        Schema::dropIfExists('contact_messages');
        Schema::dropIfExists('newsletter_signups');
        Schema::dropIfExists('audit_log');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('ai_conversations');
        Schema::dropIfExists('settings');
        Schema::dropIfExists('delivery_zones');
        Schema::dropIfExists('faqs');
        Schema::dropIfExists('lookbook_items');
        Schema::dropIfExists('home_blocks');
        Schema::dropIfExists('journal_posts');
        Schema::dropIfExists('coupons');
        Schema::dropIfExists('wishlists');
        Schema::dropIfExists('appointments');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('cart_items');
        Schema::dropIfExists('carts');
        Schema::dropIfExists('media');
        Schema::dropIfExists('product_images');
        Schema::dropIfExists('product_variants');
        Schema::dropIfExists('products');
        Schema::dropIfExists('collections');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('addresses');
        Schema::dropIfExists('users');
    }
};
