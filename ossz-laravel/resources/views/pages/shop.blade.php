@extends('layouts.app')

@section('title', t('shop.title'))

@section('content')
    @php
        $loc = locale();
        $q = request()->query();
    @endphp

    <section class="wrap" style="padding:3rem 0 1rem">
        <p class="eyebrow">{{ t('shop.eyebrow') }}</p>
        <h1 class="display" style="font-size:1.8rem">{{ t('shop.title') }}</h1>

        <form method="GET" action="{{ route('shop') }}" style="margin-top:1.5rem;display:grid;gap:.75rem">
            <div class="card" style="display:flex;gap:.6rem;padding:.6rem;align-items:center">
                <input class="field" style="border:none;box-shadow:none" type="search" name="q"
                       value="{{ $query }}" placeholder="{{ t('shop.searchHint') }}" aria-label="{{ t('shop.searchLabel') }}">
                <button class="btn btn-primary btn-sm" type="submit">{{ t('search.cta') }}</button>
            </div>

            <div style="display:flex;flex-wrap:wrap;gap:.6rem;align-items:center">
                <select class="field" style="width:auto" name="category" aria-label="{{ t('shop.category') }}">
                    <option value="">{{ t('shop.category') }}</option>
                    @foreach ($facets['categories'] as $cat)
                        <option value="{{ $cat->slug }}" @checked(($q['category'] ?? '') === $cat->slug)>{{ \App\Support\I18n::pick($cat->name, $cat->name_fr) }}</option>
                    @endforeach
                </select>

                <select class="field" style="width:auto" name="collection" aria-label="{{ t('shop.collection') }}">
                    <option value="">{{ t('shop.collection') }}</option>
                    @foreach ($facets['collections'] as $col)
                        <option value="{{ $col->slug }}" @checked(($q['collection'] ?? '') === $col->slug)>{{ \App\Support\I18n::pick($col->name, $col->name_fr) }}</option>
                    @endforeach
                </select>

                <select class="field" style="width:auto" name="size" aria-label="{{ t('buy.size') }}">
                    <option value="">{{ t('buy.size') }}</option>
                    @foreach ($facets['sizes'] as $size)
                        <option value="{{ $size }}" @checked(($q['size'] ?? '') === $size)>{{ $size }}</option>
                    @endforeach
                </select>

                <select class="field" style="width:auto" name="availability" aria-label="{{ t('shop.availability') }}">
                    <option value="">{{ t('shop.availability') }}</option>
                    <option value="in_stock" @checked(($q['availability'] ?? '') === 'in_stock')>{{ t('shop.inStock') }}</option>
                    <option value="out_of_stock" @checked(($q['availability'] ?? '') === 'out_of_stock')>{{ t('shop.outOfStock') }}</option>
                </select>

                <select class="field" style="width:auto" name="sort" aria-label="{{ t('shop.sortBy') }}">
                    <option value="newest" @checked(($q['sort'] ?? 'newest') === 'newest')>{{ t('shop.newest') }}</option>
                    <option value="price_asc" @checked(($q['sort'] ?? '') === 'price_asc')>{{ t('shop.priceAsc') }}</option>
                    <option value="price_desc" @checked(($q['sort'] ?? '') === 'price_desc')>{{ t('shop.priceDesc') }}</option>
                    <option value="popular" @checked(($q['sort'] ?? '') === 'popular')>{{ t('shop.popular') }}</option>
                </select>

                <button class="btn btn-secondary btn-sm" type="submit">{{ t('shop.filters') }}</button>
                <a class="btn btn-ghost btn-sm" href="{{ route('shop') }}">{{ t('shop.clearAll') }}</a>
            </div>
        </form>
    </section>

    <section class="wrap" style="padding-bottom:4rem">
        <p style="font-size:.78rem;color:var(--muted);margin:.5rem 0 1.5rem">
            {{ $total }} {{ $total === 1 ? t('shop.piece') : t('shop.pieces') }}
        </p>

        @if (count($products) === 0)
            <div class="card" style="padding:3rem;text-align:center">
                <h2 class="display" style="font-size:1.3rem">{{ t('shop.noneTitle') }}</h2>
                <p style="margin-top:.6rem;font-size:.85rem;color:var(--ink-soft)">{{ t('shop.noneBody') }}</p>
                <a class="btn btn-secondary btn-sm" style="margin-top:1.2rem" href="{{ route('shop') }}">{{ t('shop.clearFilters') }}</a>
            </div>
        @else
            <div class="grid grid-4">
                @foreach ($products as $p)
                    @include('partials.product-card', ['p' => $p])
                @endforeach
            </div>
        @endif
    </section>
@endsection
