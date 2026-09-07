<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Backoffice') · OSSZ Collections</title>
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/poppins?family=300;400;500&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('css/app.css') }}">
    @stack('styles')
</head>
<body>
@php
    $user = $osszUser ?? \App\Models\User::find(session('user_id'));
    $canFulfil = \App\Support\Auth::canFulfilOrders($user->role ?? 'customer');
    $canManage = \App\Support\Auth::canManageCatalogue($user->role ?? 'customer');
    $isAdmin = \App\Support\Auth::isAdmin($user->role ?? 'customer');
    $current = request()->route() ? request()->route()->getName() : '';
@endphp

<div class="admin-layout">
    <aside class="admin-sidebar">
        <div class="brand">OSSZ Collections</div>
        <nav>
            <a href="{{ route('admin.dashboard') }}" class="{{ str_starts_with($current, 'admin.dashboard') ? 'active' : '' }}">{{ is_fr() ? 'Tableau de bord' : 'Dashboard' }}</a>
            @if ($canFulfil)
                <a href="{{ route('admin.orders.index') }}" class="{{ str_starts_with($current, 'admin.orders') ? 'active' : '' }}">{{ is_fr() ? 'Commandes' : 'Orders' }}</a>
                <a href="{{ route('admin.appointments') }}" class="{{ $current === 'admin.appointments' ? 'active' : '' }}">{{ t('nav.appointments') }}</a>
                <a href="{{ route('admin.notifications') }}" class="{{ $current === 'admin.notifications' ? 'active' : '' }}">{{ is_fr() ? 'Notifications' : 'Notifications' }}</a>
                <a href="{{ route('admin.contact') }}" class="{{ $current === 'admin.contact' ? 'active' : '' }}">{{ is_fr() ? 'Messages' : 'Messages' }}</a>
                <a href="{{ route('admin.ai-gaps') }}" class="{{ $current === 'admin.ai-gaps' ? 'active' : '' }}">AI gaps</a>
            @endif
            @if ($canManage)
                <a href="{{ route('admin.products.index') }}" class="{{ str_starts_with($current, 'admin.products') ? 'active' : '' }}">{{ is_fr() ? 'Catalogue' : 'Products' }}</a>
                <a href="{{ route('admin.collections.index') }}" class="{{ $current === 'admin.collections.index' ? 'active' : '' }}">{{ t('nav.collections') }}</a>
                <a href="{{ route('admin.inventory') }}" class="{{ $current === 'admin.inventory' ? 'active' : '' }}">{{ is_fr() ? 'Stock' : 'Inventory' }}</a>
                <a href="{{ route('admin.media') }}" class="{{ $current === 'admin.media' ? 'active' : '' }}">{{ is_fr() ? 'Médias' : 'Media' }}</a>
            @endif
            @if ($isAdmin)
                <a href="{{ route('admin.homepage') }}" class="{{ $current === 'admin.homepage' ? 'active' : '' }}">{{ is_fr() ? 'Accueil' : 'Homepage' }}</a>
                <a href="{{ route('admin.journal') }}" class="{{ $current === 'admin.journal' ? 'active' : '' }}">{{ t('nav.journal') }}</a>
                <a href="{{ route('admin.lookbook') }}" class="{{ $current === 'admin.lookbook' ? 'active' : '' }}">{{ t('nav.lookbook') }}</a>
                <a href="{{ route('admin.faqs') }}" class="{{ $current === 'admin.faqs' ? 'active' : '' }}">FAQ</a>
                <a href="{{ route('admin.coupons') }}" class="{{ $current === 'admin.coupons' ? 'active' : '' }}">{{ is_fr() ? 'Codes promo' : 'Coupons' }}</a>
                <a href="{{ route('admin.customers') }}" class="{{ $current === 'admin.customers' ? 'active' : '' }}">{{ is_fr() ? 'Clients' : 'Customers' }}</a>
                <a href="{{ route('admin.staff') }}" class="{{ $current === 'admin.staff' ? 'active' : '' }}">{{ is_fr() ? 'Équipe' : 'Staff' }}</a>
                <a href="{{ route('admin.settings') }}" class="{{ $current === 'admin.settings' ? 'active' : '' }}">{{ is_fr() ? 'Réglages' : 'Settings' }}</a>
                <a href="{{ route('admin.export', ['type' => 'orders']) }}">{{ is_fr() ? 'Exporter (CSV)' : 'Export (CSV)' }}</a>
            @endif
        </nav>

        <div style="margin-top:2rem;font-size:.72rem;color:rgba(255,255,255,.55)">
            {{ $user->email ?? '' }}<br>{{ $user->role ?? '' }}
        </div>
        <form method="POST" action="{{ route('logout') }}" style="margin-top:.8rem">
            @csrf
            <button class="btn btn-sm" style="background:rgba(255,255,255,.12);color:#fff" type="submit">{{ is_fr() ? 'Se déconnecter' : 'Sign out' }}</button>
        </form>
        <a class="btn btn-sm" style="margin-top:1.4rem;background:rgba(255,255,255,.12);color:#fff" href="{{ route('home') }}">← {{ is_fr() ? 'Boutique' : 'Storefront' }}</a>
    </aside>

    <div class="admin-main">
        <div class="admin-topbar">
            <h1>@yield('title', 'Dashboard')</h1>
        </div>

        @if (session('success'))
            <div class="flash flash-success" style="margin:0 0 1rem">{{ session('success') }}</div>
        @endif
        @if (session('error'))
            <div class="flash flash-error" style="margin:0 0 1rem">{{ session('error') }}</div>
        @endif
        @if ($errors->any())
            <div class="flash flash-error" style="margin:0 0 1rem">{{ implode(' · ', $errors->all()) }}</div>
        @endif

        @yield('content')
    </div>
</div>
@stack('scripts')
</body>
</html>
