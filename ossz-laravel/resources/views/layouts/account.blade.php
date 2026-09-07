@extends('layouts.app')

@section('content')
    <div class="wrap" style="padding:3rem 0;display:grid;gap:2.5rem;grid-template-columns:1fr">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem">
            <div>
                <p class="eyebrow">{{ is_fr() ? 'Mon compte' : 'My account' }}</p>
                <h1 class="display" style="font-size:1.5rem">{{ $osszUser->full_name ?: $osszUser->email }}</h1>
            </div>
            <form method="POST" action="{{ route('logout') }}">
                @csrf
                <button class="btn btn-ghost btn-sm" type="submit">{{ is_fr() ? 'Se déconnecter' : 'Sign out' }}</button>
            </form>
        </div>

        <nav style="display:flex;gap:1.5rem;flex-wrap:wrap;border-bottom:1px solid var(--line);padding-bottom:1rem;font-size:.8rem;text-transform:uppercase;letter-spacing:.1em">
            <a class="link-underline {{ url()->current() === route('account.home') ? '' : '' }}" href="{{ route('account.home') }}">{{ is_fr() ? 'Aperçu' : 'Overview' }}</a>
            <a class="link-underline" href="{{ route('account.orders') }}">{{ is_fr() ? 'Commandes' : 'Orders' }}</a>
            <a class="link-underline" href="{{ route('account.appointments') }}">{{ t('nav.appointments') }}</a>
            <a class="link-underline" href="{{ route('account.addresses') }}">{{ is_fr() ? 'Adresses' : 'Addresses' }}</a>
            <a class="link-underline" href="{{ route('account.wishlist') }}">{{ t('buy.wishlist') }}</a>
            <a class="link-underline" href="{{ route('account.profile') }}">{{ is_fr() ? 'Profil' : 'Profile' }}</a>
        </nav>

        <div>
            @yield('account')
        </div>
    </div>
@endsection
