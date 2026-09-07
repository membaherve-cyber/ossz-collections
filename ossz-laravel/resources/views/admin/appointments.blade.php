@extends('layouts.admin')

@section('title', 'Appointments - OSSZ Backoffice')

@section('content')
<div class="p-6">
    <div class="flex items-center justify-between mb-8">
        <div>
            <h1 class="text-2xl font-bold">Appointments</h1>
            <p class="text-gray-500">Manage customer appointments and consultations</p>
        </div>
        <div class="flex gap-2">
            <button class="px-4 py-2 border rounded-lg hover:bg-gray-50 transition">Export</button>
        </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
        <div class="flex flex-wrap gap-4">
            <input type="date" 
                class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
            <select class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
            </select>
            <select class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
                <option value="">All Services</option>
                <option value="consultation">Consultation</option>
                <option value="fitting">Fitting</option>
                <option value="bespoke">Bespoke Order</option>
                <option value="alteration">Alteration</option>
            </select>
        </div>
    </div>

    <!-- Appointments List -->
    <div class="bg-white rounded-lg shadow-lg overflow-hidden">
        <table class="w-full">
            <thead>
                <tr class="bg-gray-50 border-b">
                    <th class="text-left py-3 px-4 font-semibold">Customer</th>
                    <th class="text-left py-3 px-4 font-semibold">Service</th>
                    <th class="text-left py-3 px-4 font-semibold">Date & Time</th>
                    <th class="text-left py-3 px-4 font-semibold">Deposit</th>
                    <th class="text-left py-3 px-4 font-semibold">Status</th>
                    <th class="text-left py-3 px-4 font-semibold">Actions</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($appointments ?? [] as $appointment)
                    <tr class="border-b hover:bg-gray-50">
                        <td class="py-3 px-4">
                            <div>
                                <p class="font-medium">{{ $appointment->customer_name }}</p>
                                <p class="text-sm text-gray-500">{{ $appointment->customer_email }}</p>
                            </div>
                        </td>
                        <td class="py-3 px-4">{{ ucfirst($appointment->service) }}</td>
                        <td class="py-3 px-4">
                            <p>{{ $appointment->date->format('M d, Y') }}</p>
                            <p class="text-sm text-gray-500">{{ $appointment->time }}</p>
                        </td>
                        <td class="py-3 px-4">
                            {{ $appointment->deposit_paid ? number_format($appointment->deposit_amount, 0, '.', ' ') . ' XAF' : '—' }}
                        </td>
                        <td class="py-3 px-4">
                            <span class="inline-block px-2 py-1 text-xs rounded-full 
                                {{ $appointment->status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                                   ($appointment->status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                                   ($appointment->status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800')) }}">
                                {{ ucfirst($appointment->status) }}
                            </span>
                        </td>
                        <td class="py-3 px-4">
                            <div class="flex gap-2">
                                @if ($appointment->status === 'pending')
                                    <button class="text-green-600 hover:text-green-800">Confirm</button>
                                @endif
                                <a href="#" class="text-amber-600 hover:text-amber-800">View</a>
                            </div>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="6" class="py-8 text-center text-gray-500">
                            No appointments found
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>
@endsection
