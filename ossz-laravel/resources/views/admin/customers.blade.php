@extends('layouts.admin')

@section('title', is_fr() ? 'Clients' : 'Customers')

@section('content')
    <div class="card" style="padding:1.2rem">
        <table class="table">
            <thead>
                <tr><th>Email</th><th>{{ is_fr() ? 'Nom' : 'Name' }}</th><th>{{ t('contact.wa') }}</th><th>{{ is_fr() ? 'Commandes' : 'Orders' }}</th><th>{{ is_fr() ? 'Inscrit le' : 'Joined' }}</th></tr>
            </thead>
            <tbody>
                @forelse ($customers as $customer)
                    <tr>
                        <td style="font-size:.85rem">{{ $customer->email }}</td>
                        <td>{{ $customer->full_name }}</td>
                        <td style="font-size:.8rem">{{ $customer->phone }}</td>
                        <td>{{ $customer->orders_count }}</td>
                        <td style="font-size:.75rem">{{ format_date($customer->created_at) }}</td>
                    </tr>
                @empty
                    <tr><td colspan="5" style="color:var(--muted)">{{ is_fr() ? 'Aucun client.' : 'No customers.' }}</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>
@endsection
