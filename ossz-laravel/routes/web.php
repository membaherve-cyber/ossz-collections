<?php

use App\Http\Controllers\Admin;
use App\Http\Controllers\AccountController;
use App\Http\Controllers\Api\ConciergeController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\MediaFileController;
use App\Http\Controllers\PageController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| OSSZ Collections — full route map
|--------------------------------------------------------------------------
| Mirrors the Next.js App Router pages in src/app/** and the API routes
| in src/app/api/**. Storefront routes are public; /admin carries role
| middleware; POST routes are CSRF-protected by the web group.
*/

// ── Storefront ──────────────────────────────────────────────────────
Route::get('/', [PageController::class, 'home'])->name('home');
Route::get('/shop', [PageController::class, 'shop'])->name('shop');
Route::get('/product/{slug}', [PageController::class, 'product'])->name('product.show');
Route::get('/collections', [PageController::class, 'collections'])->name('collections.index');
Route::get('/collections/{slug}', [PageController::class, 'collection'])->name('collections.show');
Route::get('/search', [PageController::class, 'search'])->name('search');
Route::get('/journal', [PageController::class, 'journal'])->name('journal.index');
Route::get('/journal/{slug}', [PageController::class, 'journalPost'])->name('journal.show');
Route::get('/lookbook', [PageController::class, 'lookbook'])->name('lookbook');
Route::get('/faq', [PageController::class, 'faq'])->name('faq');
Route::get('/about', [PageController::class, 'about'])->name('about');
Route::get('/appointments', [PageController::class, 'appointments'])->name('appointments');
Route::get('/contact', [PageController::class, 'contact'])->name('contact');
Route::get('/size-guide', [PageController::class, 'sizeGuide'])->name('size-guide');
Route::get('/offline', [PageController::class, 'offline'])->name('offline');

// ── Locale switch ───────────────────────────────────────────────────
Route::post('/locale', [PageController::class, 'switchLocale'])->name('locale.switch');

// ── Public form actions ─────────────────────────────────────────────
Route::post('/newsletter', [PageController::class, 'newsletter'])->name('newsletter');
Route::post('/contact', [PageController::class, 'contactSubmit'])->name('contact.submit');
Route::post('/appointments', [PageController::class, 'bookAppointment'])->name('appointments.book');
Route::post('/order-lookup', [PageController::class, 'orderLookup'])->name('order.lookup');
Route::get('/order-lookup', [PageController::class, 'orderLookupForm'])->name('order.lookup.form');
Route::get('/order/{number}', [PageController::class, 'orderTrack'])->name('order.track');

// ── Cart & checkout ─────────────────────────────────────────────────
Route::post('/cart/add', [CartController::class, 'add'])->name('cart.add');
Route::post('/cart/update', [CartController::class, 'update'])->name('cart.update');
Route::post('/cart/remove', [CartController::class, 'remove'])->name('cart.remove');
Route::post('/cart/coupon', [CartController::class, 'coupon'])->name('cart.coupon');
Route::get('/cart', [CartController::class, 'show'])->name('cart.show');
Route::get('/checkout', [CheckoutController::class, 'show'])->name('checkout.show');
Route::post('/checkout', [CheckoutController::class, 'placeOrder'])->name('checkout.place');
Route::get('/checkout/payment-proof', [CheckoutController::class, 'paymentProofForm'])->name('checkout.proof.form');
Route::post('/checkout/payment-proof', [CheckoutController::class, 'paymentProof'])->name('checkout.proof');

// ── Auth ────────────────────────────────────────────────────────────
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->name('login.attempt');
Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
Route::post('/register', [AuthController::class, 'register'])->name('register.store');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
Route::get('/forgot-password', [AuthController::class, 'showForgot'])->name('password.request');
Route::post('/forgot-password', [AuthController::class, 'requestReset'])->name('password.email');
Route::get('/reset-password', [AuthController::class, 'showReset'])->name('password.reset');
Route::post('/reset-password', [AuthController::class, 'completeReset'])->name('password.update');

// ── Account (customer) ──────────────────────────────────────────────
Route::middleware('auth.customer')->prefix('account')->group(function () {
    Route::get('/', [AccountController::class, 'index'])->name('account.home');
    Route::get('/orders', [AccountController::class, 'orders'])->name('account.orders');
    Route::get('/appointments', [AccountController::class, 'appointments'])->name('account.appointments');
    Route::post('/appointments/cancel', [AccountController::class, 'cancelAppointment'])->name('account.appointments.cancel');
    Route::get('/addresses', [AccountController::class, 'addresses'])->name('account.addresses');
    Route::post('/addresses', [AccountController::class, 'saveAddress'])->name('account.addresses.save');
    Route::post('/addresses/delete', [AccountController::class, 'deleteAddress'])->name('account.addresses.delete');
    Route::get('/profile', [AccountController::class, 'profile'])->name('account.profile');
    Route::post('/profile', [AccountController::class, 'updateProfile'])->name('account.profile.update');
    Route::get('/wishlist', [AccountController::class, 'wishlist'])->name('account.wishlist');
    Route::post('/wishlist/toggle', [AccountController::class, 'toggleWishlist'])->name('account.wishlist.toggle');
});

// ── Uploaded media (payment proofs, lookbook videos, library) ──────
Route::get('/media/{path}', [MediaFileController::class, 'show'])
    ->where('path', '.*')
    ->name('media.show');

// ── API ─────────────────────────────────────────────────────────────
Route::post('/api/concierge', [ConciergeController::class, 'reply'])->name('api.concierge');
Route::get('/api/product/{slug}', [ConciergeController::class, 'productJson'])->name('api.product');

// ── Admin backoffice ────────────────────────────────────────────────
Route::middleware('auth.admin')->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [Admin\DashboardController::class, 'index'])->name('dashboard');
    Route::post('/order-status', [Admin\DashboardController::class, 'updateOrderStatus'])->name('orders.status');
    Route::post('/notification/resend', [Admin\DashboardController::class, 'resendNotification'])->name('notifications.resend');

    // Orders (staff+)
    Route::get('/orders', [Admin\OrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{order}', [Admin\OrderController::class, 'show'])->name('orders.show');
    Route::get('/orders/{order}/packing-slip', [Admin\OrderController::class, 'packingSlip'])->name('orders.packing-slip');
    Route::post('/orders/{order}/status', [Admin\OrderController::class, 'updateStatus'])->name('orders.update-status');
    Route::post('/orders/{order}/notes', [Admin\OrderController::class, 'saveNotes'])->name('orders.notes');

    // Catalogue (uploader/admin)
    Route::get('/products', [Admin\ProductController::class, 'index'])->name('products.index');
    Route::get('/products/create', [Admin\ProductController::class, 'create'])->name('products.create');
    Route::post('/products', [Admin\ProductController::class, 'store'])->name('products.store');
    Route::get('/products/{product}/edit', [Admin\ProductController::class, 'edit'])->name('products.edit');
    Route::post('/products/{product}', [Admin\ProductController::class, 'update'])->name('products.update');
    Route::post('/products/{product}/delete', [Admin\ProductController::class, 'destroy'])->name('products.destroy');
    Route::post('/products/{product}/variants', [Admin\ProductController::class, 'addVariant'])->name('products.variants.add');
    Route::post('/variants/{variant}/delete', [Admin\ProductController::class, 'deleteVariant'])->name('products.variants.delete');
    Route::post('/products/{product}/images', [Admin\ProductController::class, 'addImage'])->name('products.images.add');
    Route::post('/images/{image}/delete', [Admin\ProductController::class, 'deleteImage'])->name('products.images.delete');
    Route::get('/collections', [Admin\ProductController::class, 'collections'])->name('collections.index');
    Route::post('/collections', [Admin\ProductController::class, 'storeCollection'])->name('collections.store');
    Route::post('/collections/{collection}/delete', [Admin\ProductController::class, 'destroyCollection'])->name('collections.destroy');
    Route::get('/inventory', [Admin\ProductController::class, 'inventory'])->name('inventory');
    Route::post('/inventory', [Admin\ProductController::class, 'updateStock'])->name('inventory.update');

    // Content (admin)
    Route::get('/homepage', [Admin\ContentController::class, 'homepage'])->name('homepage');
    Route::post('/homepage', [Admin\ContentController::class, 'saveHomeBlock'])->name('homepage.save');
    Route::post('/homepage/delete', [Admin\ContentController::class, 'deleteHomeBlock'])->name('homepage.delete');
    Route::get('/journal', [Admin\ContentController::class, 'journal'])->name('journal');
    Route::post('/journal', [Admin\ContentController::class, 'savePost'])->name('journal.save');
    Route::post('/journal/delete', [Admin\ContentController::class, 'deletePost'])->name('journal.delete');
    Route::get('/lookbook', [Admin\ContentController::class, 'lookbook'])->name('lookbook');
    Route::post('/lookbook', [Admin\ContentController::class, 'saveLook'])->name('lookbook.save');
    Route::post('/lookbook/delete', [Admin\ContentController::class, 'deleteLook'])->name('lookbook.delete');
    Route::post('/lookbook/upload', [Admin\ContentController::class, 'uploadLook'])->name('lookbook.upload');
    Route::get('/faqs', [Admin\ContentController::class, 'faqs'])->name('faqs');
    Route::post('/faqs', [Admin\ContentController::class, 'saveFaq'])->name('faqs.save');
    Route::post('/faqs/delete', [Admin\ContentController::class, 'deleteFaq'])->name('faqs.delete');

    // People & misc (admin)
    Route::get('/appointments', [Admin\AppointmentController::class, 'index'])->name('appointments');
    Route::post('/appointments/{appointment}', [Admin\AppointmentController::class, 'update'])->name('appointments.update');
    Route::get('/customers', [Admin\CustomerController::class, 'index'])->name('customers');
    Route::get('/staff', [Admin\StaffController::class, 'index'])->name('staff');
    Route::post('/staff', [Admin\StaffController::class, 'store'])->name('staff.store');
    Route::post('/staff/role', [Admin\StaffController::class, 'updateRole'])->name('staff.role');
    Route::get('/contact', [Admin\ContactController::class, 'index'])->name('contact');
    Route::post('/contact/reply', [Admin\ContactController::class, 'reply'])->name('contact.reply');
    Route::post('/contact/handled', [Admin\ContactController::class, 'markHandled'])->name('contact.handled');
    Route::get('/coupons', [Admin\CouponController::class, 'index'])->name('coupons');
    Route::post('/coupons', [Admin\CouponController::class, 'store'])->name('coupons.store');
    Route::post('/coupons/toggle', [Admin\CouponController::class, 'toggle'])->name('coupons.toggle');
    Route::get('/media', [Admin\MediaController::class, 'index'])->name('media');
    Route::post('/media', [Admin\MediaController::class, 'upload'])->name('media.upload');
    Route::get('/notifications', [Admin\NotificationController::class, 'index'])->name('notifications');
    Route::get('/ai-gaps', [Admin\AiGapController::class, 'index'])->name('ai-gaps');
    Route::post('/ai-gaps', [Admin\AiGapController::class, 'resolve'])->name('ai-gaps.resolve');
    Route::get('/settings', [Admin\SettingsController::class, 'index'])->name('settings');
    Route::post('/settings', [Admin\SettingsController::class, 'save'])->name('settings.save');
    Route::get('/export', [Admin\ExportController::class, 'csv'])->name('export');
});
