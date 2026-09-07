@extends('layouts.admin')

@section('title', is_fr() ? 'Stock' : 'Inventory')

@section('content')
    <div class="card" style="padding:1.2rem">
        <table class="table">
            <thead>
                <tr>
                    <th>{{ is_fr() ? 'Pièce' : 'Piece' }}</th>
                    <th>{{ t('buy.size') }}</th><th>{{ t('buy.colour') }}</th>
                    <th>{{ is_fr() ? 'Stock' : 'Stock' }}</th>
                    <th>{{ is_fr() ? 'Seuil' : 'Threshold' }}</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                @foreach ($variants as $variant)
                    <tr class="{{ $variant->stock_qty <= $variant->low_stock_threshold ? 'low-stock' : '' }}">
                        <td>
                            <strong style="font-size:.85rem">{{ $variant->product->name }}</strong>
                            @if ($variant->stock_qty <= $variant->low_stock_threshold)
                                <span class="pill pill-red">{{ is_fr() ? 'bas' : 'low' }}</span>
                            @endif
                        </td>
                        <td>{{ $variant->size }}</td>
                        <td>{{ $variant->colour }}</td>
                        <td>
                            <form method="POST" action="{{ route('admin.inventory.update') }}" style="display:flex;gap:.4rem;align-items:center">
                                @csrf
                                <input type="hidden" name="variant_id" value="{{ $variant->id }}">
                                <input class="field" style="width:80px;padding:.3rem .5rem" type="number" name="stock_qty" min="0" value="{{ $variant->stock_qty }}">
                                <button class="btn btn-secondary btn-sm" type="submit">✓</button>
                            </form>
                        </td>
                        <td>{{ $variant->low_stock_threshold }}</td>
                        <td style="font-size:.75rem;color:var(--muted)">
                            {{ $variant->product->collection?->name ?? '' }}
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    @push('styles')
        <style>.low-stock td { background: rgba(248, 215, 218, .25); }</style>
    @endpush
@endsection
