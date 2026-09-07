<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Admin') · OSSZ Collections</title>
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/poppins?family=300;400;500&display=swap" rel="stylesheet">
    @livewireStyles
    <style>
        :root {
            --ink: #1b1917; --ink-soft: #4a453f; --muted: #8a8279;
            --canvas: #f7f7f8; --paper: #fff; --line: #e6e7ea;
            --accent: #9b5f2f; --accent-soft: #f1f2f4; --clay: #2f3630;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Poppins', sans-serif; background: var(--canvas); color: var(--ink); }
        .layout { display: flex; min-height: 100vh; }
        .sidebar { width: 240px; background: var(--ink); color: #fff; padding: 1.5rem; flex-shrink: 0; }
        .sidebar a { color: rgba(255,255,255,.7); text-decoration: none; display: block; padding: .5rem .75rem; border-radius: 4px; font-size: .82rem; letter-spacing: .06em; text-transform: uppercase; transition: all .15s; }
        .sidebar a:hover, .sidebar a.active { background: rgba(255,255,255,.1); color: #fff; }
        .sidebar .brand { font-size: 1.1rem; font-weight: 300; letter-spacing: -.02em; margin-bottom: 2rem; }
        .main { flex: 1; padding: 2rem; }
        .topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .topbar h1 { font-size: 1.6rem; font-weight: 300; letter-spacing: -.02em; }
        .card { background: var(--paper); border: 1px solid var(--line); border-radius: 4px; padding: 1.25rem; }
        .btn { display: inline-flex; align-items: center; gap: .4rem; border: none; border-radius: 4px; padding: .5rem 1rem; font-size: .78rem; letter-spacing: .08em; text-transform: uppercase; cursor: pointer; font-family: inherit; }
        .btn-primary { background: var(--ink); color: #fff; }
        .btn-primary:hover { background: var(--accent); }
        .btn-secondary { background: transparent; color: var(--ink); border: 1px solid var(--ink); }
        .field { width: 100%; border: 1px solid var(--line); border-radius: 4px; padding: .6rem .75rem; font-size: .88rem; font-family: inherit; }
        .field:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
        .text-muted { color: var(--muted); font-size: .78rem; }
        .eyebrow { font-size: .68rem; letter-spacing: .16em; text-transform: uppercase; color: var(--muted); }
        .chip { display: inline-block; border: 1px solid var(--line); border-radius: 999px; padding: .3rem .7rem; font-size: .72rem; cursor: pointer; }
        .chip.active { background: var(--ink); color: #fff; border-color: var(--ink); }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; font-size: .72rem; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); padding: .75rem .5rem; border-bottom: 1px solid var(--line); }
        td { padding: .75rem .5rem; border-bottom: 1px solid rgba(230,231,234,.6); font-size: .85rem; }
        .pill { display: inline-block; padding: .2rem .6rem; border-radius: 999px; font-size: .68rem; font-weight: 500; }
        .pill-green { background: #d4edda; color: #155724; }
        .pill-yellow { background: #fff3cd; color: #856404; }
        .pill-blue { background: #d1ecf1; color: #0c5460; }
        .pill-gray { background: #e9ecef; color: #495057; }
        .pill-red { background: #f8d7da; color: #721c24; }
    </style>
</head>
<body>
    <div class="layout">
        <aside class="sidebar">
            <div class="brand">OSSZ Collections</div>
            <nav>
                <a href="{{ route('admin.dashboard') }}" class="{{ request()->routeIs('admin.dashboard') ? 'active' : '' }}">Dashboard</a>
                <a href="{{ route('admin.orders.index') }}" class="{{ request()->routeIs('admin.orders.*') ? 'active' : '' }}">Orders</a>
                <a href="{{ route('admin.products.index') }}" class="{{ request()->routeIs('admin.products.*') ? 'active' : '' }}">Products</a>
                <a href="{{ route('admin.appointments.index') }}" class="{{ request()->routeIs('admin.appointments.*') ? 'active' : '' }}">Appointments</a>
                <a href="{{ route('admin.chatbot') }}" class="{{ request()->routeIs('admin.chatbot') ? 'active' : '' }}">AI Concierge</a>
                <a href="{{ route('logout') }}" onclick="event.preventDefault(); document.getElementById('logout-form').submit();">Sign out</a>
            </nav>
            <form id="logout-form" action="{{ route('logout') }}" method="POST" class="hidden">@csrf</form>
        </aside>
        <div class="main">
            <div class="topbar">
                <h1>@yield('title', 'Dashboard')</h1>
                <span class="text-muted">{{ auth()->user()->name ?? auth()->user()->email ?? 'Admin' }}</span>
            </div>
            @if(session('success'))
                <div class="card" style="border-left: 3px solid #28a745; margin-bottom: 1rem;">{{ session('success') }}</div>
            @endif
            @if(session('error'))
                <div class="card" style="border-left: 3px solid #dc3545; margin-bottom: 1rem;">{{ session('error') }}</div>
            @endif
            @yield('content')
        </div>
    </div>
    @livewireScripts
</body>
</html>
