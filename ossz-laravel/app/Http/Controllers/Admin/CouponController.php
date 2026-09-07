<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;

class CouponController extends Controller
{
    public function index()
    {
        $this->guard();

        return view('admin.coupons', [
            'coupons' => Coupon::orderByDesc('id')->get(),
        ]);
    }

    public function store(\Illuminate\Http\Request $request)
    {
        $this->guard();
        $data = $request->validate([
            'code' => 'required|string|max:40',
            'type' => 'required|in:percentage,fixed,free_delivery',
            'value' => 'nullable|integer|min:0',
            'usage_limit' => 'nullable|integer|min:0',
            'expires_at' => 'nullable|date',
        ]);
        $data['code'] = strtoupper(trim($data['code']));
        if (Coupon::where('code', $data['code'])->exists()) {
            return back()->with('error', 'That code already exists.');
        }
        Coupon::create([
            'code' => $data['code'],
            'type' => $data['type'],
            'value' => (int) ($data['value'] ?? 0),
            'usage_limit' => (int) ($data['usage_limit'] ?? 0),
            'expires_at' => $data['expires_at'] ?? null,
            'is_active' => true,
        ]);

        return back()->with('success', "Coupon {$data['code']} created.");
    }

    public function toggle(\Illuminate\Http\Request $request)
    {
        $this->guard();
        $coupon = Coupon::findOrFail((int) $request->input('id'));
        $coupon->update(['is_active' => ! $coupon->is_active]);

        return back()->with('success', "Coupon {$coupon->code} ".($coupon->is_active ? 'activated' : 'deactivated').'.');
    }

    private function guard(): void
    {
        $user = request()->attributes->get('ossz_user');
        if (! \App\Support\Auth::isAdmin($user->role)) {
            abort(redirect()->route('admin.dashboard')->with('error', 'Admins only.'));
        }
    }
}
