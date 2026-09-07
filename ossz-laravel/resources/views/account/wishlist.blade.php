@extends('layouts.account')

@section('account')
    <div>
        <h2 class="display" style="font-size:1.2rem;margin-bottom:1.2rem">{{ t('buy.wishlist') }}</h2>
        @php
            $cards = $rows->map(fn ($row) => [
                'id' => $row->product->id,
                'name' => $row->product->name,
                'name_fr' => $row->product->name_fr,
                'slug' => $row->product->slug,
                'basePrice' => (int) $row->product->base_price,
                'image' => $row->product->images->first()->url ?? '',
                'imageAlt' => $row->product->name,
                'inStock' => $row->product->variants->contains(fn ($v) => (int) $v->stock_qty > 0),
            ])->all();
        @endphp

        @if (count($cards) === 0)
            <div class="card" style="padding:2.5rem;text-align:center">
                <p style="font-size:.85rem;color:var(--muted)">
                    {{ is_fr() ? 'Votre liste de favoris est vide — touchez « Favoris » sur une pièce pour la conserver ici.' : 'Your wishlist is empty — tap “Wishlist” on a piece to keep it here.' }}
                </p>
            </div>
        @else
            <div class="grid grid-4">
                @foreach ($cards as $p)
                    @include('partials.product-card', ['p' => $p])
                @endforeach
            </div>
        @endif
    </div>
@endsection
