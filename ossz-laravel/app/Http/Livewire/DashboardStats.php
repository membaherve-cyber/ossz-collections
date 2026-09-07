<?php

namespace App\Http\Livewire;

use Livewire\Component;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\Appointment;

class DashboardStats extends Component
{
    public int $totalOrders = 0;
    public int $pendingOrders = 0;
    public int $totalProducts = 0;
    public int $totalRevenue = 0;
    public int $upcomingAppointments = 0;
    public int $totalCustomers = 0;
    public array $recentOrders = [];
    public array $lowStockProducts = [];

    public function mount()
    {
        $this->loadStats();
    }

    public function loadStats()
    {
        $this->totalOrders = Order::count();
        $this->pendingOrders = Order::whereIn('status', ['placed', 'processing'])->count();
        $this->totalProducts = Product::where('is_active', true)->count();
        $this->totalRevenue = Order::where('status', '!=', 'cancelled')->sum('total_amount');
        $this->upcomingAppointments = Appointment::where('date', '>=', now())->count();
        $this->totalCustomers = User::where('role', 'customer')->count();

        $this->recentOrders = Order::latest()
            ->take(5)
            ->get()
            ->map(fn($order) => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'customer_name' => $order->customer_name ?? 'Guest',
                'total_amount' => number_format($order->total_amount, 0, '.', ' '),
                'status' => $order->status,
                'created_at' => $order->created_at->diffForHumans(),
            ])
            ->toArray();

        $this->lowStockProducts = Product::where('is_active', true)
            ->whereHas('variants', function ($q) {
                $q->where('stock', '<=', 5);
            })
            ->take(5)
            ->get()
            ->map(fn($product) => [
                'id' => $product->id,
                'name' => $product->name,
                'price' => number_format($product->price, 0, '.', ' '),
                'stock' => $product->variants->min('stock') ?? 0,
            ])
            ->toArray();
    }

    public function render()
    {
        return view('livewire.dashboard-stats');
    }
}
