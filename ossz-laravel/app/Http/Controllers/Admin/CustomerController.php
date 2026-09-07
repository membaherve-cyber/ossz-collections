<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;

class CustomerController extends Controller
{
    public function index()
    {
        $this->guard();

        return view('admin.customers', [
            'customers' => User::where('role', 'customer')->withCount('orders')->orderByDesc('created_at')->limit(500)->get(),
        ]);
    }

    private function guard(): void
    {
        $user = request()->attributes->get('ossz_user');
        if (! \App\Support\Auth::isAdmin($user->role)) {
            abort(redirect()->route('admin.dashboard')->with('error', 'Admins only.'));
        }
    }
}
