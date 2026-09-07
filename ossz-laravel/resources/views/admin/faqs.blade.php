@extends('layouts.admin')

@section('title', 'FAQ')

@section('content')
    <div style="display:grid;gap:1rem">
        @foreach ($faqs as $faq)
            <form method="POST" action="{{ route('admin.faqs.save') }}" class="card" style="padding:1.3rem">
                @csrf
                <input type="hidden" name="id" value="{{ $faq->id }}">
                <div class="form-grid cols-2">
                    <input class="field" name="category" value="{{ $faq->category }}" placeholder="Category EN">
                    <input class="field" name="category_fr" value="{{ $faq->category_fr }}" placeholder="Category FR">
                    <input class="field" name="question" value="{{ $faq->question }}" required>
                    <input class="field" name="question_fr" value="{{ $faq->question_fr }}">
                    <input class="field" type="number" name="sort_order" value="{{ $faq->sort_order }}">
                </div>
                <div class="form-grid cols-2" style="margin-top:.8rem">
                    <textarea class="field" name="answer" rows="3" required>{{ $faq->answer }}</textarea>
                    <textarea class="field" name="answer_fr" rows="3">{{ $faq->answer_fr }}</textarea>
                </div>
                <button class="btn btn-primary btn-sm" style="margin-top:.8rem" type="submit">{{ is_fr() ? 'Enregistrer' : 'Save' }}</button>
            </form>
        @endforeach

        <form method="POST" action="{{ route('admin.faqs.save') }}" class="card" style="padding:1.3rem">
            @csrf
            <h3 style="font-size:.95rem;font-weight:400;margin-bottom:.8rem">+ {{ is_fr() ? 'Nouvelle FAQ' : 'New FAQ' }}</h3>
            <div class="form-grid">
                <input class="field" name="question" placeholder="Question" required>
                <textarea class="field" name="answer" rows="2" placeholder="Answer" required></textarea>
                <input class="field" name="category" placeholder="General">
                <button class="btn btn-secondary btn-sm" type="submit">{{ is_fr() ? 'Créer' : 'Create' }}</button>
            </div>
        </form>
    </div>
@endsection
