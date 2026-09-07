@extends('layouts.app')

@section('title', t('pdp.sizeGuide'))

@section('content')
    <section class="wrap" style="padding:3rem 0 1rem;max-width:720px">
        <h1 class="display" style="font-size:1.8rem">{{ t('pdp.sizeGuide') }}</h1>
        <p style="margin-top:1rem;font-size:.9rem;color:var(--ink-soft)">{{ t('pdp.sizeGuideBody') }}</p>
    </section>

    <section class="wrap" style="max-width:720px;padding-bottom:4rem">
        <div class="card" style="padding:1rem 1.5rem">
            <table class="table">
                <thead>
                    <tr>
                        <th>{{ t('buy.size') }}</th>
                        <th>FR</th>
                        <th>{{ is_fr() ? 'Poitrine (cm)' : 'Bust (cm)' }}</th>
                        <th>{{ is_fr() ? 'Taille (cm)' : 'Waist (cm)' }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td>XS</td><td>34</td><td>80–84</td><td>62–66</td></tr>
                    <tr><td>S</td><td>36</td><td>84–88</td><td>66–70</td></tr>
                    <tr><td>M</td><td>38</td><td>88–94</td><td>70–76</td></tr>
                    <tr><td>L</td><td>40</td><td>94–100</td><td>76–82</td></tr>
                </tbody>
            </table>
        </div>
        <p style="margin-top:1.2rem;font-size:.85rem;color:var(--ink-soft)">
            {{ is_fr() ? 'Entre deux tailles ? Le concierge ou un rendez-vous essayage vous aidera à trancher.' : 'Between sizes? The concierge or a fitting appointment will help you decide.' }}
        </p>
    </section>
@endsection
