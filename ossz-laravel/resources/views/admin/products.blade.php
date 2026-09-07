@extends('layouts.admin')

@section('title', is_fr() ? 'Catalogue' : 'Products')

@section('content')
    <div style="display:flex;justify-content:space-between;gap:1rem;margin-bottom:1.2rem;flex-wrap:wrap">
        <form method="GET" style="display:flex;gap:.6rem">
            <input class="field" style="max-width:280px" type="search" name="q" value="{{ $q }}" placeholder="{{ is_fr() ? 'Rechercher…' : 'Search…' }}">
            <button class="btn btn-secondary btn-sm" type="submit">{{ is_fr() ? 'Filtrer' : 'Filter' }}</button>
        </form>
        <a class="btn btn-primary btn-sm" href="{{ route('admin.products.create') }}">+ {{ is_fr() ? 'Nouvelle pièce' : 'New product' }}</a>
    </div>

    <div class="card" style="padding:1.2rem">
        <table class="table">
            <thead>
                <tr>
                    <th>{{ is_fr() ? 'Pièce' : 'Piece' }}</th>
                    <th>{{ is_fr() ? 'Catégorie' : 'Category' }}</th>
                    <th>{{ t('buy.size') }} / {{ t('buy.colour') }}</th>
                    <th>{{ is_fr() ? 'Prix' : 'Price' }}</th>
                    <th>{{ is_fr() ? 'Stock' : 'Stock' }}</th>
                    <th>{{ is_fr() ? 'Statut' : 'Status' }}</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                @forelse ($products as $product)
                    <tr>
                        <td>
                            <strong style="font-size:.85rem">{{ $product->name }}</strong><br>
                            <span style="font-size:.72rem;color:var(--muted)">{{ $product->slug }}</span>
                        </td>
                        <td style="font-size:.8rem">{{ $product->category?->name ?? '—' }}<br><span style="color:var(--muted);font-size:.72rem">{{ $product->collection?->name ?? '' }}</span></td>
                        <td style="font-size:.75rem">{{ $product->variants->map(fn ($v) => $v->size.'/'.$v->colour.' ('.$v->stock_qty.')')->implode(', ') }}</td>
                        <td>{{ format_xaf($product->base_price) }}</td>
                        <td>{{ $product->variants->sum('stock_qty') }}</td>
                        <td>
                            <span class="pill {{ $product->is_published ? 'pill-green' : 'pill-gray' }}">{{ $product->is_published ? (is_fr() ? 'Publié' : 'Live') : (is_fr() ? 'Brouillon' : 'Draft') }}</span>
                            @if ($product->is_featured)<span class="pill pill-yellow">{{ is_fr() ? 'Vedette' : 'Featured' }}</span>@endif
                        </td>
                        <td>
                            <a class="btn btn-ghost btn-sm" href="{{ route('admin.products.edit', $product) }}">{{ is_fr() ? 'Modifier' : 'Edit' }}</a>
                        </td>
                    </tr>
                @empty
                    <tr><td colspan="7" style="color:var(--muted)">{{ is_fr() ? 'Aucune pièce.' : 'No products.' }}</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>
@endsection
