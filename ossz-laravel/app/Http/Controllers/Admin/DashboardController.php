<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\ContactMessage;
use App\Models\Notification;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use App\Support\Auth;
use App\Support\Notify;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        $user = request()->attributes->get('ossz_user');
        $fulfil = Auth::canFulfilOrders($user->role);

        $stats = [
            'ordersPlaced' => Order::count(),
            'ordersOpen' => Order::whereIn('status', ['placed', 'processing', 'ready', 'out_for_delivery'])->count(),
            'revenue' => (int) Order::where('status', '!=', 'cancelled')->sum('total'),
            'products' => Product::count(),
            'lowStock' => ProductVariant::whereColumn('stock_qty', '<=', 'low_stock_threshold')->count(),
            'customers' => User::where('role', 'customer')->count(),
            'appointments' => Appointment::where('status', 'requested')->count(),
            'messages' => ContactMessage::where('handled', false)->count(),
        ];

        $recentOrders = $fulfil ? Order::with('items')->orderByDesc('created_at')->limit(8)->get() : collect();

        return view('admin.dashboard', [
            'user' => $user,
            'stats' => $stats,
            'recentOrders' => $recentOrders,
            'canFulfil' => $fulfil,
            'canManage' => Auth::canManageCatalogue($user->role),
        ]);
    }

    public function updateOrderStatus(Request $request)
    {
        $request->validate(['order_number' => 'required|string', 'status' => 'required|string']);
        $order = Order::where('order_number', $request->input('order_number'))->firstOrFail();
        $this->transition($order, $request->input('status'));

        return back()->with('success', 'Order '.$order->order_number.' → '.status_label($order->status));
    }

    public function resendNotification(Request $request)
    {
        $notification = Notification::findOrFail((int) $request->input('id'));
        if ($notification->order_id) {
            Notify::orderStatusChanged($notification->order, $notification->order->status);
        }

        return back()->with('success', 'Notification re-queued.');
    }

    /** Shared by Dashboard quick-action and OrderController. */
    public static function transition(Order $order, string $status): void
    {
        $allowed = ['placed', 'processing', 'ready', 'out_for_delivery', 'delivered', 'returned', 'cancelled'];
        if (! in_array($status, $allowed, true) || $status === $order->status) {
            return;
        }
        $old = $order->status;
        $order->update(['status' => $status, 'updated_at' => now()]);
        Notify::orderStatusChanged($order, $old);
    }
}
