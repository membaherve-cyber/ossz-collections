<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\AppointmentController;

// ── Public shop ───────────────────────────────────────────────────────────
Route::get('/', fn() => view('pages.home'))->name('home');
Route::get('/shop', fn() => view('pages.shop'))->name('shop');
Route::get('/product/{slug}', fn($slug) => view('pages.product', ['slug' => $slug, 'product' => \App\Models\Product::where('slug', $slug)->firstOrFail()]))->name('product');
Route::get('/collections', function() {
    $collections = \App\Models\Collection::where('is_published', true)->orderBy('sort_order')->get();
    return view('pages.collections', compact('collections'));
})->name('collections');
Route::get('/collections/{slug}', function($slug) {
    $collection = \App\Models\Collection::where('slug', $slug)->firstOrFail();
    $products = \App\Models\Product::where('collection_id', $collection->id)->get();
    return view('pages.collection-detail', compact('collection', 'products'));
})->name('collections.show');
Route::get('/order/{number}', fn($number) => view('pages.order-track', ['number' => $number]))->name('order.track');

// ── Auth ──────────────────────────────────────────────────────────────────
Route::get('/login', [LoginController::class, 'showLoginForm'])->name('login');
Route::post('/login', [LoginController::class, 'login']);
Route::post('/logout', [LoginController::class, 'logout'])->name('logout');

// ── Admin backoffice ──────────────────────────────────────────────────────
Route::prefix('admin')->name('admin.')->middleware('auth')->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    
    // Orders
    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{order}', [OrderController::class, 'show'])->name('orders.show');
    Route::post('/orders/{order}/status', [OrderController::class, 'updateStatus'])->name('orders.status');
    Route::post('/orders/track', [OrderController::class, 'quickTrack'])->name('orders.track');
    
    // Products
    Route::get('/products', [ProductController::class, 'index'])->name('products.index');
    Route::get('/products/create', [ProductController::class, 'create'])->name('products.create');
    Route::post('/products', [ProductController::class, 'store'])->name('products.store');
    Route::get('/products/{product}/edit', [ProductController::class, 'edit'])->name('products.edit');
    Route::put('/products/{product}', [ProductController::class, 'update'])->name('products.update');
    Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');
    
    // Appointments
    Route::get('/appointments', [AppointmentController::class, 'index'])->name('appointments.index');
    Route::get('/appointments/{appointment}', [AppointmentController::class, 'show'])->name('appointments.show');
    Route::put('/appointments/{appointment}', [AppointmentController::class, 'update'])->name('appointments.update');
    
    // AI Chatbot
    Route::get('/concierge', fn() => view('admin.chatbot'))->name('chatbot');
});

