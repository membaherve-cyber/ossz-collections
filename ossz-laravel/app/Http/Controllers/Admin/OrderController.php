<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $filter = $request->get('status');
        $query = Order::with('items')->latest();
        if ($filter) $query->where('status', $filter);
        $orders = $query->limit(100)->get();
        return view('pages.admin.orders.index', compact('orders', 'filter'));
    }

    public function show(Order $order)
    {
        $order->load('items');
        return view('pages.admin.orders.show', compact('order'));
    }

    public function updateStatus(Request $request, Order $order)
    {
        $request->validate(['status' => 'required|in:placed,processing,ready,out_for_delivery,delivered,returned,cancelled']);
        $order->update(['status' => $request->status, 'updated_at' => now()]);
        app(NotificationService::class)->orderStatusChanged($order);
        return back()->with('success', "Order {$order->order_number} updated to {$request->status}.");
    }

    public function quickTrack(Request $request)
    {
        $request->validate([
            'order_number' => 'required|string',
            'status' => 'required|in:placed,processing,ready,out_for_delivery,delivered,returned,cancelled',
        ]);
        $order = Order::where('order_number', strtoupper($request->order_number))->first();
        if (! $order) return back()->with('error', 'Order not found.');
        $order->update(['status' => $request->status, 'updated_at' => now()]);
        app(NotificationService::class)->orderStatusChanged($order);
        return back()->with('success', "Order {$order->order_number} updated — client notified via WhatsApp & email.");
    }
}
