@extends('layouts.app')

@section('title', t('offline.title'))

@section('content')
    <section class="wrap" style="padding:6rem 0;text-align:center">
        <h1 class="display" style="font-size:1.6rem">{{ t('offline.title') }}</h1>
        <p style="margin-top:1rem;font-size:.9rem;color:var(--ink-soft)">{{ t('offline.body') }}</p>
        <a class="btn btn-primary" style="margin-top:2rem" href="{{ url()->previous() ?: route('home') }}">{{ t('offline.retry') }}</a>
    </section>
@endsection
