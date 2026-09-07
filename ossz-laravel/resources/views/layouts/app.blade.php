<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <meta name="theme-color" content="#1b1917">
    <title>@yield('title', 'OSSZ Collections — Contemporary fashion house, Douala')</title>
    <meta name="description" content="OSSZ Collections is a contemporary fashion house in Douala, Cameroon — African design sensibility, modern luxury tailoring, delivered across Cameroon.">
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/poppins?family=300;400;500&display=swap" rel="stylesheet">
    <link rel="icon" href="/icons/favicon-32.png" sizes="32x32" type="image/png">
    <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" sizes="180x180">
    <link rel="stylesheet" href="{{ asset('css/app.css') }}">
    @stack('styles')
</head>
<body>
    <a href="#main" class="skip-link">Skip to content</a>

    @include('partials.header')

    <main id="main">
        @yield('content')
    </main>

    @include('partials.footer')
    @include('partials.concierge')

    @stack('scripts')
    <script src="{{ asset('js/app.js') }}" defer></script>
</body>
</html>
