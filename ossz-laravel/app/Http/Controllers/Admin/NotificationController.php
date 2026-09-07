<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;

class NotificationController extends Controller
{
    public function index()
    {
        $this->guard();

        return view('admin.notifications', [
            'notifications' => Notification::with('order')->orderByDesc('created_at')->limit(300)->get(),
        ]);
    }

    private function guard(): void
    {
        $user = request()->attributes->get('ossz_user');
        if (! \App\Support\Auth::canFulfilOrders($user->role)) {
            abort(redirect()->route('admin.dashboard')->with('error', 'Insufficient permissions.'));
        }
    }
}
