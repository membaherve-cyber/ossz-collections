@extends('layouts.app')

@section('title', t('search.title'))

@section('content')
    <section class="wrap" style="padding:3rem 0 1rem;max-width:720px">
        <h1 class="display" style="font-size:1.8rem">{{ t('search.title') }}</h1>

        <form method="GET" action="{{ route('search') }}" style="display:flex;gap:.6rem;margin-top:1.5rem">
            <input class="field" type="search" name="q" value="{{ $q }}" placeholder="{{ t('search.placeholder') }}" autofocus>
            <button class="btn btn-primary" type="submit">{{ t('search.cta') }}</button>
        </form>

        @if ($q === '')
            <div style="margin-top:2rem">
                <p class="eyebrow">{{ t('search.popular') }}</p>
                <div class="grid grid-4" style="margin-top:1rem">
                    @foreach ($popular as $p)
                        @include('partials.product-card', ['p' => $p])
                    @endforeach
                </div>
            </div>
        @endif
    </section>

    @if ($q !== '')
        <section class="wrap" style="padding-bottom:4rem">
            <p style="font-size:.85rem;color:var(--ink-soft);margin-bottom:1.5rem">
                {{ t('search.results', ['n' => count($products), 'q' => $q]) }}
            </p>
            @if (count($products) === 0)
                <div class="card" style="padding:2.5rem;text-align:center">
                    <h2 class="display" style="font-size:1.2rem">{{ t('shop.noneTitle') }}</h2>
                    <p style="margin-top:.5rem;font-size:.85rem;color:var(--ink-soft)">{{ t('shop.noneBody') }}</p>
                    <a class="btn btn-secondary btn-sm" style="margin-top:1.2rem" href="{{ route('shop') }}">{{ t('search.browse') }}</a>
                </div>
            @else
                <div class="grid grid-4">
                    @foreach ($products as $p)
                        @include('partials.product-card', ['p' => $p])
                    @endforeach
                </div>
            @endif
        </section>
    @endif
@endsection
