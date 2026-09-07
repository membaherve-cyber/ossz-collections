<?php

namespace App\Support;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Coupon;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Models\Product;
use Illuminate\Support\Facades\Session;

/**
 * Cart service — ported from src/lib/store.ts (getCart, computeDiscount)
 * and src/lib/actions.ts (addToCart, updateCartLine, removeCartLine,
 * applyCoupon). Guest carts live in the session; on login the guest cart
 * merges into the user's cart (mergeGuestCart).
 */
final class Cart
{
    public const SESSION_KEY = 'ossz_cart_id';

    /** @return array{id: ?int, lines: array, subtotal: int, itemCount: int, couponCode: ?string, discount: int} */
    public static function view(): array
    {
        $cartId = self::currentCartId();
        if (! $cartId) {
            return ['id' => null, 'lines' => [], 'subtotal' => 0, 'itemCount' => 0, 'couponCode' => null, 'discount' => 0];
        }

        $cart = Cart::find($cartId);
        if (! $cart) {
            Session::forget(self::SESSION_KEY);

            return ['id' => null, 'lines' => [], 'subtotal' => 0, 'itemCount' => 0, 'couponCode' => null, 'discount' => 0];
        }

        $items = CartItem::query()
            ->where('cart_id', $cart->id)
            ->with(['variant.product'])
            ->orderBy('id')
            ->get();

        $imageCache = [];
        $lines = [];
        foreach ($items as $item) {
            $variant = $item->variant;
            $product = $variant?->product;
            if (! $product) {
                continue;
            }
            $pid = $product->id;
            if (! isset($imageCache[$pid])) {
                $img = ProductImage::where('product_id', $pid)->orderBy('sort_order')->first();
                $imageCache[$pid] = $img->url ?? '';
            }
            $lines[] = [
                'itemId' => $item->id,
                'variantId' => $variant->id,
                'productId' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'size' => $variant->size,
                'colour' => $variant->colour,
                'unitPrice' => (int) ($variant->price_override ?? $product->base_price),
                'quantity' => $item->quantity,
                'stockQty' => (int) $variant->stock_qty,
                'image' => $imageCache[$pid],
            ];
        }

        $subtotal = 0;
        $itemCount = 0;
        foreach ($lines as $line) {
            $subtotal += $line['unitPrice'] * $line['quantity'];
            $itemCount += $line['quantity'];
        }
        $couponCode = $cart->coupon_code;
        $discount = $couponCode ? self::computeDiscount($couponCode, $subtotal) : 0;

        return compact('cart', 'lines', 'subtotal', 'itemCount', 'couponCode', 'discount');
    }

    /** Current cart id or null — creates nothing. */
    public static function currentCartId(): ?int
    {
        $userId = session('user_id');
        if ($userId) {
            $cart = Cart::where('user_id', $userId)->first();
            return $cart?->id;
        }

        return Session::get(self::SESSION_KEY) ?: null;
    }

    /** Current cart id, creating the cart row when missing. */
    public static function getOrCreateId(): int
    {
        $userId = session('user_id');
        if ($userId) {
            $cart = Cart::firstOrCreate(['user_id' => $userId]);
            return $cart->id;
        }
        $cartId = Session::get(self::SESSION_KEY);
        if ($cartId) {
            $cart = Cart::find($cartId);
            if ($cart) {
                return $cart->id;
            }
        }
        $cart = Cart::create(['session_id' => Session::getId()]);
        Session::put(self::SESSION_KEY, $cart->id);

        return $cart->id;
    }

    public static function addVariant(int $variantId, int $quantity = 1): void
    {
        $cartId = self::getOrCreateId();
        $item = CartItem::where('cart_id', $cartId)->where('variant_id', $variantId)->first();
        if ($item) {
            $item->quantity += $quantity;
            $item->save();
        } else {
            CartItem::create(['cart_id' => $cartId, 'variant_id' => $variantId, 'quantity' => $quantity]);
        }
    }

    public static function updateLine(int $itemId, int $quantity): void
    {
        $item = CartItem::find($itemId);
        if (! $item) {
            return;
        }
        if ($quantity <= 0) {
            $item->delete();
        } else {
            $item->quantity = $quantity;
            $item->save();
        }
    }

    public static function removeLine(int $itemId): void
    {
        CartItem::where('id', $itemId)->delete();
    }

    public static function applyCoupon(string $code): bool
    {
        $cartId = self::getOrCreateId();
        $code = strtoupper(trim($code));
        if ($code === '') {
            Cart::where('id', $cartId)->update(['coupon_code' => null]);
            return true;
        }
        $coupon = Coupon::where('code', $code)->where('is_active', true)->first();
        if (! $coupon) {
            return false;
        }
        if ($coupon->expires_at && $coupon->expires_at->isPast()) {
            return false;
        }
        Cart::where('id', $cartId)->update(['coupon_code' => $code]);

        return true;
    }

    public static function computeDiscount(string $code, int $subtotal): int
    {
        $coupon = Coupon::where('code', strtoupper($code))->where('is_active', true)->first();
        if (! $coupon) {
            return 0;
        }
        if ($coupon->expires_at && $coupon->expires_at->isPast()) {
            return 0;
        }
        if ($coupon->usage_limit > 0 && $coupon->times_used >= $coupon->usage_limit) {
            return 0;
        }
        if ($coupon->type === 'percentage') {
            return (int) round($subtotal * $coupon->value / 100);
        }
        if ($coupon->type === 'fixed') {
            return min((int) $coupon->value, $subtotal);
        }

        return 0; // free_delivery is applied against the delivery fee
    }

    /** Merge the guest cart into the user's cart after sign-in. */
    public static function mergeGuestCart(int $userId): void
    {
        $guestCartId = Session::get(self::SESSION_KEY);
        if (! $guestCartId) {
            return;
        }
        $guestCart = Cart::find($guestCartId);
        Session::forget(self::SESSION_KEY);
        if (! $guestCart) {
            return;
        }
        $userCart = Cart::where('user_id', $userId)->first();
        if (! $userCart) {
            $guestCart->user_id = $userId;
            $guestCart->session_id = null;
            $guestCart->save();
            return;
        }
        if ($guestCart->coupon_code && ! $userCart->coupon_code) {
            $userCart->coupon_code = $guestCart->coupon_code;
            $userCart->save();
        }
        $guestLines = CartItem::where('cart_id', $guestCart->id)->get();
        foreach ($guestLines as $line) {
            $match = CartItem::where('cart_id', $userCart->id)
                ->where('variant_id', $line->variant_id)
                ->first();
            if ($match) {
                $match->quantity += $line->quantity;
                $match->save();
            } else {
                CartItem::create([
                    'cart_id' => $userCart->id,
                    'variant_id' => $line->variant_id,
                    'quantity' => $line->quantity,
                ]);
            }
        }
        $guestCart->delete();
    }
}
