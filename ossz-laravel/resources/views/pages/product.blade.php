@extends('layouts.app')

@section('title', \App\Support\I18n::pick($product->name, $product->name_fr))

@section('content')
    @php
        $p = $product;
        $firstName = \App\Support\I18n::pick($p->name, $p->name_fr);
        $firstImage = $images->first();
    @endphp

    <div class="wrap pdp">
        <div class="pdp-gallery">
            @forelse ($images as $img)
                <div class="photo-frame" style="aspect-ratio:4/5">
                    <img src="{{ $img->url }}" alt="{{ $img->alt_text ?: $firstName }}" loading="{{ $loop->first ? 'eager' : 'lazy' }}">
                </div>
            @empty
                <div class="photo-frame" style="aspect-ratio:4/5"></div>
            @endforelse
        </div>

        <div class="pdp-info">
            @if ($p->collection)
                <a class="eyebrow link-underline" href="{{ route('collections.show', $p->collection->slug) }}">
                    {{ \App\Support\I18n::pick($p->collection->name, $p->collection->name_fr) }}
                </a>
            @endif
            <h1 class="display">{{ $firstName }}</h1>
            <p class="price">{{ format_xaf($p->base_price) }}</p>

            @if (trim((string) \App\Support\I18n::pick($p->description, $p->description_fr)) !== '')
                <p style="margin-top:1rem;font-size:.9rem;color:var(--ink-soft);white-space:pre-line">
                    {{ \App\Support\I18n::pick($p->description, $p->description_fr) }}
                </p>
            @endif

            <form method="POST" action="{{ route('cart.add') }}" style="margin-top:1.5rem">
                @csrf
                <input type="hidden" name="variant_id" id="variant-input" value="{{ $variants->firstWhere('stock_qty', '>', 0)->id ?? $variants->first()?->id }}">

                @if ($variants->count() > 0)
                    <p class="label">{{ t('buy.size') }}</p>
                    <div class="variant-picker" id="variant-picker">
                        @foreach ($variants as $v)
                            <button type="button" class="chip {{ $loop->first ? 'chip-active' : '' }}"
                                    data-variant="{{ $v->id }}"
                                    data-stock="{{ (int) $v->stock_qty }}"
                                    @disabled($v->stock_qty < 1)>
                                {{ $v->size }} · {{ $v->colour }}
                            </button>
                        @endforeach
                    </div>
                @endif

                <div style="display:flex;gap:.6rem;flex-wrap:wrap">
                    <button class="btn btn-primary" type="submit" {{ $variants->every(fn ($v) => $v->stock_qty < 1) ? 'disabled' : '' }}>
                        {{ t('buy.addToCart') }}
                    </button>
                    <button class="btn btn-secondary" type="submit" name="buy_now" value="1" {{ $variants->every(fn ($v) => $v->stock_qty < 1) ? 'disabled' : '' }}>
                        {{ t('buy.now') }}
                    </button>
                </div>
            </form>

            <div class="pdp-block">
                <h3>{{ t('buy.delivery') }}</h3>
                <p style="font-size:.85rem;color:var(--ink-soft)">{{ t('buy.returns') }}</p>
            </div>

            @if (trim((string) $p->details) !== '')
                <div class="pdp-block">
                    <h3>{{ t('pdp.details') }}</h3>
                    <p style="font-size:.85rem;color:var(--ink-soft);white-space:pre-line">{{ \App\Support\I18n::pick($p->details, $p->details_fr) }}</p>
                </div>
            @endif

            @if (trim((string) $p->care_instructions) !== '')
                <div class="pdp-block">
                    <h3>{{ t('pdp.care') }}</h3>
                    <p style="font-size:.85rem;color:var(--ink-soft);white-space:pre-line">{{ \App\Support\I18n::pick($p->care_instructions, $p->care_instructions_fr) }}</p>
                </div>
            @endif

            <div class="pdp-block">
                <h3>{{ t('pdp.deliveryReturns') }}</h3>
                <p style="font-size:.85rem;color:var(--ink-soft)">{{ t('pdp.deliveryReturnsBody') }}</p>
                <p style="margin-top:.8rem">
                    <a class="link-underline" style="font-size:.85rem" target="_blank" rel="noreferrer"
                       href="{{ \App\Support\wa_link(\App\Support\Settings::get('whatsapp_number'), ($p->name).' — ') }}">
                        {{ t('pdp.askWa') }}
                    </a>
                </p>
            </div>
        </div>
    </div>

    @if (count($related) > 0)
        <section class="wrap" style="padding-bottom:4rem">
            <h2 class="display" style="font-size:1.3rem;margin-bottom:1.5rem">{{ t('pdp.alsoLike') }}</h2>
            <div class="grid grid-4">
                @foreach (array_slice($related, 0, 4) as $rp)
                    @include('partials.product-card', ['p' => $rp])
                @endforeach
            </div>
        </section>
    @endif

    @push('styles')
        <style>
            .chip[disabled] { opacity: .4; text-decoration: line-through; cursor: not-allowed; }
        </style>
    @endpush
@endsection
