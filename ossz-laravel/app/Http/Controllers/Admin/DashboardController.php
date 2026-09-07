<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;

class DashboardController extends Controller
{
    public function index()
    {
        $recentOrders = Order::with('items')->latest()->limit(10)->get();
        $stats = [
            'total_orders' => Order::count(),
            'pending_orders' => Order::where('status', 'placed')->count(),
            'revenue_today' => Order::whereDate('created_at', today())->sum('total'),
        ];
        return view('pages.admin.dashboard', compact('recentOrders', 'stats'));
    }
}
