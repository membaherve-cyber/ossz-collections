@extends('layouts.admin')

@section('title', is_fr() ? 'Tableau de bord' : 'Dashboard')

@section('content')
    <div class="stat-grid">
        <div class="card stat"><p class="stat-label">{{ is_fr() ? 'Commandes' : 'Orders' }}</p><p class="value">{{ $stats['ordersPlaced'] }}</p></div>
        <div class="card stat"><p class="stat-label">{{ is_fr() ? 'En cours' : 'Open' }}</p><p class="value">{{ $stats['ordersOpen'] }}</p></div>
        <div class="card stat"><p class="stat-label">{{ is_fr() ? 'Chiffre d\'affaires' : 'Revenue' }}</p><p class="value">{{ format_xaf($stats['revenue']) }}</p></div>
        @if ($canManage)
            <div class="card stat"><p class="stat-label">{{ is_fr() ? 'Pièces' : 'Products' }}</p><p class="value">{{ $stats['products'] }}</p></div>
            <div class="card stat"><p class="stat-label">{{ is_fr() ? 'Stock bas' : 'Low stock' }}</p><p class="value">{{ $stats['lowStock'] }}</p></div>
        @endif
        <div class="card stat"><p class="stat-label">{{ is_fr() ? 'Clients' : 'Customers' }}</p><p class="value">{{ $stats['customers'] }}</p></div>
        @if ($canFulfil)
            <div class="card stat"><p class="stat-label">RDV</p><p class="value">{{ $stats['appointments'] }}</p></div>
            <div class="card stat"><p class="stat-label">{{ is_fr() ? 'Messages' : 'Messages' }}</p><p class="value">{{ $stats['messages'] }}</p></div>
        @endif
    </div>

    @if ($canFulfil && $recentOrders->isNotEmpty())
        <div class="card" style="padding:1.5rem">
            <div style="display:flex;justify-content:space-between;align-items:center">
                <h2 style="font-size:1rem;font-weight:400">{{ is_fr() ? 'Commandes récentes' : 'Recent orders' }}</h2>
                <a class="btn btn-ghost btn-sm" href="{{ route('admin.orders.index') }}">{{ is_fr() ? 'Tout voir' : 'View all' }} →</a>
            </div>
            <table class="table" style="margin-top:1rem">
                <thead>
                    <tr><th>#</th><th>{{ is_fr() ? 'Client' : 'Customer' }}</th><th>{{ is_fr() ? 'Date' : 'Date' }}</th><th>{{ is_fr() ? 'Statut' : 'Status' }}</th><th>{{ is_fr() ? 'Total' : 'Total' }}</th><th></th></tr>
                </thead>
                <tbody>
                    @foreach ($recentOrders as $order)
                        <tr>
                            <td><a class="link-underline" href="{{ route('admin.orders.show', $order) }}">{{ $order->order_number }}</a></td>
                            <td>{{ $order->customer_name }}</td>
                            <td>{{ format_date($order->created_at) }}</td>
                            <td><span class="pill pill-blue">{{ status_label($order->status) }}</span></td>
                            <td>{{ format_xaf($order->total) }}</td>
                            <td>
                                <form method="POST" action="{{ route('admin.orders.update-status', $order) }}" class="inline-form">
                                    @csrf
                                    <input type="hidden" name="status" value="processing">
                                    <button class="btn btn-ghost btn-sm" type="submit">→ {{ is_fr() ? 'Préparer' : 'Process' }}</button>
                                </form>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    @endif

    @if (! $canFulfil && ! $canManage)
        <div class="card" style="padding:2rem">
            <p style="font-size:.9rem;color:var(--muted)">{{ is_fr() ? 'Votre compte n\'a pas encore de permissions d\'administration.' : 'Your account has no admin permissions yet.' }}</p>
        </div>
    @endif
@endsection
