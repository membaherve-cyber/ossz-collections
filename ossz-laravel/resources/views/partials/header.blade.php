@php
    $osszUser = $osszUser ?? (\App\Models\User::find(session('user_id')));
    $cartView = \App\Support\Cart::view();
@endphp

<header class="site-header">
    <div class="wrap">
        <button class="nav-toggle" aria-label="{{ t('nav.openMenu') }}">☰</button>

        <a href="{{ route('home') }}" class="wordmark" aria-label="OSSZ Collections"></a>

        <nav class="main-nav">
            <a href="{{ route('shop') }}">{{ t('nav.shop') }}</a>
            <a href="{{ route('collections.index') }}">{{ t('nav.collections') }}</a>
            <a href="{{ route('lookbook') }}">{{ t('nav.lookbook') }}</a>
            <a href="{{ route('journal.index') }}">{{ t('nav.journal') }}</a>
            <a href="{{ route('appointments') }}">{{ t('nav.appointments') }}</a>
            <a href="{{ route('about') }}">{{ t('nav.about') }}</a>
        </nav>

        <div class="header-actions">
            <form method="POST" action="{{ route('locale.switch') }}">
                @csrf
                <input type="hidden" name="locale" value="{{ locale() === 'fr' ? 'en' : 'fr' }}">
                <button type="submit" class="btn-ghost btn btn-sm">{{ t('lang.switch') }}</button>
            </form>
            <a href="{{ route('search') }}" aria-label="{{ t('nav.search') }}">⌕</a>
            @if ($osszUser && \App\Support\Auth::canEnterBackOffice($osszUser->role))
                <a href="{{ route('admin.dashboard') }}">{{ t('nav.backoffice') }}</a>
            @endif
            @if ($osszUser)
                <a href="{{ route('account.home') }}">{{ \App\Support\I18n::pick($osszUser->full_name ?: $osszUser->email, null) }}</a>
            @else
                <a href="{{ route('login') }}">{{ t('nav.signin') }}</a>
            @endif
            <a href="{{ route('cart.show') }}">{{ t('nav.cart') }}@if ($cartView['itemCount'] > 0) <span class="cart-count">{{ $cartView['itemCount'] }}</span>@endif</a>
        </div>
    </div>
</header>

@if (session('success'))
    <div class="flash flash-success wrap">{{ session('success') }}</div>
@endif
@if (session('error'))
    <div class="flash flash-error wrap">{{ session('error') }}</div>
@endif
@if ($errors->any())
    <div class="flash flash-error wrap">{{ implode(' · ', $errors->all()) }}</div>
@endif
