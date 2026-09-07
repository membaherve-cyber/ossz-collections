@extends('layouts.admin')

@section('title', 'Dashboard - OSSZ Backoffice')

@section('content')
<div class="p-6">
    <div class="mb-8">
        <h1 class="text-2xl font-bold">Dashboard</h1>
        <p class="text-gray-500">Welcome back, {{ auth()->user()->name ?? 'Admin' }}</p>
    </div>

    @livewire('dashboard-stats')
</div>
@endsection
