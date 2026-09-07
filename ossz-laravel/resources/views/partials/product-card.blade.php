@php
    $name = \App\Support\I18n::pick($p['name'], $p['name_fr'] ?? '');
    $img = $p['image'] ?? '';
@endphp

<a href="{{ route('product.show', $p['slug']) }}" class="product-card">
    <div class="photo-frame">
        @if (! $p['inStock'])
            <span class="badge">{{ t('buy.soldOut') }}</span>
        @elseif (! empty($p['collectionName']))
            <span class="badge" style="background:var(--accent)">{{ \App\Support\I18n::pick($p['collectionName'], $p['collectionNameFr'] ?? '') }}</span>
        @endif
        @if ($img)
            <img src="{{ $img }}" alt="{{ $p['imageAlt'] }}" loading="lazy">
        @endif
    </div>
    <div class="card-body">
        <h3>{{ $name }}</h3>
        <p class="price">{{ format_xaf($p['basePrice']) }}</p>
        <p class="card-meta">
            @if (! empty($p['categoryName'])){{ \App\Support\I18n::pick($p['categoryName'], $p['categoryNameFr'] ?? '') }} · @endif
            {{ $p['inStock'] ? t('buy.inStock') : t('buy.soldOut') }}
        </p>
    </div>
</a>
