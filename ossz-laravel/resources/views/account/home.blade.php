@extends('layouts.account')

@section('account')
    <div class="grid grid-2">
        <div class="card" style="padding:1.5rem">
            <p class="eyebrow">{{ is_fr() ? 'Dernières commandes' : 'Recent orders' }}</p>
            @forelse ($orders as $order)
                <div style="display:flex;justify-content:space-between;padding:.7rem 0;border-bottom:1px solid var(--line);font-size:.85rem">
                    <span>
                        <a class="link-underline" href="{{ route('order.track', ['number' => $order->order_number, 'contact' => $order->guest_email]) }}">{{ $order->order_number }}</a>
                        <span style="color:var(--muted);font-size:.72rem"> · {{ format_date($order->created_at) }}</span>
                    </span>
                    <span>{{ format_xaf($order->total) }} · {{ status_label($order->status) }}</span>
                </div>
            @empty
                <p style="margin-top:.8rem;font-size:.85rem;color:var(--muted)">{{ is_fr() ? 'Aucune commande pour le moment.' : 'No orders yet.' }}</p>
            @endforelse
        </div>

        <div class="card" style="padding:1.5rem">
            <p class="eyebrow">{{ t('nav.appointments') }}</p>
            @forelse ($appointments as $apt)
                <div style="display:flex;justify-content:space-between;padding:.7rem 0;border-bottom:1px solid var(--line);font-size:.85rem">
                    <span>{{ $apt->reference }} · {{ $apt->service }}</span>
                    <span>{{ format_date_time($apt->slot_start) }} · {{ status_label($apt->status) }}</span>
                </div>
            @empty
                <p style="margin-top:.8rem;font-size:.85rem;color:var(--muted)">{{ is_fr() ? 'Aucun rendez-vous.' : 'No appointments.' }}</p>
            @endforelse
            <a class="btn btn-secondary btn-sm" style="margin-top:1rem" href="{{ route('appointments') }}">{{ t('home.bookCta') }}</a>
        </div>
    </div>
@endsection
