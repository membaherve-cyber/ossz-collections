@extends('layouts.admin')

@section('title', is_fr() ? 'Commandes' : 'Orders')

@section('content')
    <form method="GET" style="display:flex;gap:.6rem;flex-wrap:wrap;margin-bottom:1.2rem">
        <input class="field" style="max-width:280px" type="search" name="q" value="{{ $q }}" placeholder="{{ is_fr() ? 'Numéro, nom, email…' : 'Number, name, email…' }}">
        <select class="field" style="width:auto" name="status">
            <option value="">{{ is_fr() ? 'Tous les statuts' : 'All statuses' }}</option>
            @foreach (['placed', 'processing', 'ready', 'out_for_delivery', 'delivered', 'returned', 'cancelled'] as $s)
                <option value="{{ $s }}" @checked($status === $s)>{{ status_label($s) }}</option>
            @endforeach
        </select>
        <button class="btn btn-secondary btn-sm" type="submit">{{ is_fr() ? 'Filtrer' : 'Filter' }}</button>
    </form>

    <div class="card" style="padding:1.2rem">
        <table class="table">
            <thead>
                <tr>
                    <th>#</th><th>{{ is_fr() ? 'Client' : 'Customer' }}</th><th>{{ is_fr() ? 'Date' : 'Date' }}</th>
                    <th>{{ is_fr() ? 'Paiement' : 'Payment' }}</th><th>{{ is_fr() ? 'Statut' : 'Status' }}</th>
                    <th>{{ is_fr() ? 'Total' : 'Total' }}</th><th></th>
                </tr>
            </thead>
            <tbody>
                @forelse ($orders as $order)
                    <tr>
                        <td><a class="link-underline" href="{{ route('admin.orders.show', $order) }}">{{ $order->order_number }}</a></td>
                        <td>{{ $order->customer_name }}<br><span style="font-size:.72rem;color:var(--muted)">{{ $order->guest_email ?: $order->guest_phone }}</span></td>
                        <td>{{ format_date($order->created_at) }}</td>
                        <td style="font-size:.75rem">{{ payment_label($order->payment_method) }}<br>{{ status_label($order->payment_status) }}</td>
                        <td><span class="pill pill-blue">{{ status_label($order->status) }}</span></td>
                        <td>{{ format_xaf($order->total) }}</td>
                        <td>
                            <a class="btn btn-ghost btn-sm" href="{{ route('admin.orders.show', $order) }}">{{ is_fr() ? 'Ouvrir' : 'Open' }}</a>
                        </td>
                    </tr>
                @empty
                    <tr><td colspan="7" style="color:var(--muted)">{{ is_fr() ? 'Aucune commande.' : 'No orders.' }}</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>
@endsection
