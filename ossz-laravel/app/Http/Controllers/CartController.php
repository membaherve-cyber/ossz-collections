<?php

namespace App\Http\Controllers;

use App\Support\Cart;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function show()
    {
        return view('pages.cart', ['cart' => Cart::view(), 'zones' => \App\Models\DeliveryZone::where('is_active', true)->orderBy('fee')->get()]);
    }

    public function add(Request $request)
    {
        $data = $request->validate([
            'variant_id' => 'required|integer',
            'quantity' => 'nullable|integer|min:1|max:20',
        ]);
        Cart::addVariant((int) $data['variant_id'], (int) ($data['quantity'] ?? 1));
        if ($request->boolean('buy_now')) {
            return redirect()->route('checkout.show');
        }

        return redirect()->route('cart.show')->with('success', 'Added to your cart.');
    }

    public function update(Request $request)
    {
        Cart::updateLine((int) $request->input('item_id'), (int) $request->input('quantity', 1));

        return redirect()->route('cart.show')->with('success', 'Cart updated.');
    }

    public function remove(Request $request)
    {
        Cart::removeLine((int) $request->input('item_id'));

        return redirect()->route('cart.show')->with('success', 'Item removed.');
    }

    public function coupon(Request $request)
    {
        $code = trim((string) $request->input('code'));
        if ($code === '') {
            Cart::applyCoupon('');

            return back()->with('success', 'Coupon removed.');
        }
        if (Cart::applyCoupon($code)) {
            return back()->with('success', "Code {$code} applied.");
        }

        return back()->with('error', 'That code is not recognised.');
    }
}
