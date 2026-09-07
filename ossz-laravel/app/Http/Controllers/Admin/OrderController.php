<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Support\Auth;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $this->guard('orders');

        $query = Order::with('items')->orderByDesc('created_at');
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }
        if ($q = trim((string) $request->input('q'))) {
            $query->where(function ($w) use ($q) {
                $w->where('order_number', 'like', "%{$q}%")
                    ->orWhere('customer_name', 'like', "%{$q}%")
                    ->orWhere('guest_email', 'like', "%{$q}%")
                    ->orWhere('guest_phone', 'like', "%{$q}%");
            });
        }

        return view('admin.orders', [
            'orders' => $query->limit(200)->get(),
            'status' => $request->input('status', ''),
            'q' => $request->input('q', ''),
        ]);
    }

    public function show(Order $order)
    {
        $this->guard('orders');

        return view('admin.order-detail', [
            'order' => $order->load('items', 'notifications'),
        ]);
    }

    public function packingSlip(Order $order)
    {
        $this->guard('orders');

        return view('admin.packing-slip', ['order' => $order->load('items')]);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $this->guard('orders');
        $request->validate(['status' => 'required|string']);
        DashboardController::transition($order, $request->input('status'));

        return back()->with('success', 'Order updated to '.status_label($order->status).'.');
    }

    public function saveNotes(Request $request, Order $order)
    {
        $this->guard('orders');
        $order->update(['notes' => (string) $request->input('notes', '')]);

        return back()->with('success', 'Notes saved.');
    }

    /** Page-level access control — port of src/lib/guard.ts. */
    private function guard(string $area): void
    {
        $user = request()->attributes->get('ossz_user');
        $allowed = match ($area) {
            'orders' => Auth::canFulfilOrders($user->role),
            'catalogue' => Auth::canManageCatalogue($user->role),
            default => Auth::isAdmin($user->role),
        };
        if (! $allowed) {
            abort(redirect()->route('admin.dashboard')->with('error', 'Insufficient permissions.'));
        }
    }
}
