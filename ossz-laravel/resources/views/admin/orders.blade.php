@extends('layouts.admin')

@section('title', 'Orders - OSSZ Backoffice')

@section('content')
<div class="p-6">
    <div class="mb-8">
        <h1 class="text-2xl font-bold">Orders</h1>
        <p class="text-gray-500">Manage customer orders and shipments</p>
    </div>

    <!-- Quick Track Form -->
    @livewire('order-tracking')

    <!-- Orders List -->
    <div class="mt-8 bg-white rounded-lg shadow-lg p-6">
        <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold">All Orders</h2>
            <div class="flex gap-2">
                <input type="text" 
                    placeholder="Search orders..." 
                    class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
                <select class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
                    <option value="">All Status</option>
                    <option value="placed">Placed</option>
                    <option value="processing">Processing</option>
                    <option value="ready_for_pickup">Ready for Pickup</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full">
                <thead>
                    <tr class="border-b">
                        <th class="text-left py-3 px-4 font-semibold">Order #</th>
                        <th class="text-left py-3 px-4 font-semibold">Customer</th>
                        <th class="text-left py-3 px-4 font-semibold">Items</th>
                        <th class="text-left py-3 px-4 font-semibold">Total</th>
                        <th class="text-left py-3 px-4 font-semibold">Status</th>
                        <th class="text-left py-3 px-4 font-semibold">Date</th>
                        <th class="text-left py-3 px-4 font-semibold">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse ($orders ?? [] as $order)
                        <tr class="border-b hover:bg-gray-50">
                            <td class="py-3 px-4">{{ $order->order_number }}</td>
                            <td class="py-3 px-4">{{ $order->customer_name ?? 'Guest' }}</td>
                            <td class="py-3 px-4">{{ $order->items_count ?? $order->items->count() }}</td>
                            <td class="py-3 px-4">{{ number_format($order->total_amount, 0, '.', ' ') }} XAF</td>
                            <td class="py-3 px-4">
                                <span class="inline-block px-2 py-1 text-xs rounded-full 
                                    {{ $order->status === 'delivered' ? 'bg-green-100 text-green-800' : 
                                       ($order->status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                                       ($order->status === 'processing' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800')) }}">
                                    {{ ucfirst(str_replace('_', ' ', $order->status)) }}
                                </span>
                            </td>
                            <td class="py-3 px-4">{{ $order->created_at->format('M d, Y') }}</td>
                            <td class="py-3 px-4">
                                <a href="{{ route('admin.orders.show', $order->id) }}" 
                                    class="text-amber-600 hover:text-amber-800">View</a>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7" class="py-8 text-center text-gray-500">
                                No orders found
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>
@endsection
