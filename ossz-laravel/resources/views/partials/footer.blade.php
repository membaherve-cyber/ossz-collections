@php $settings = \App\Support\Settings::all(); @endphp

<footer class="site-footer">
    <div class="wrap cols">
        <div>
            <div class="wordmark" aria-label="OSSZ Collections"></div>
            <p class="mt-4">{{ t('footer.tag') }}</p>
            <p>{{ $settings['store_address'] }}</p>
            <p>{{ $settings['business_hours'] }}</p>
            <p><a href="https://wa.me/237694068219" target="_blank" rel="noreferrer">+237 694 068 219</a> ·
               <a href="https://wa.me/237651468831" target="_blank" rel="noreferrer">+237 651 468 831</a></p>
            <p><a href="mailto:{{ $settings['contact_email'] }}">{{ $settings['contact_email'] }}</a></p>
        </div>

        <div>
            <p class="eyebrow">{{ t('footer.shop') }}</p>
            <ul>
                <li><a class="link-underline" href="{{ route('shop') }}">{{ t('footer.allPieces') }}</a></li>
                <li><a class="link-underline" href="{{ route('collections.index') }}">{{ t('nav.collections') }}</a></li>
                <li><a class="link-underline" href="{{ route('lookbook') }}">{{ t('nav.lookbook') }}</a></li>
                <li><a class="link-underline" href="{{ route('appointments') }}">{{ t('home.bookCta') }}</a></li>
            </ul>
        </div>

        <div>
            <p class="eyebrow">{{ t('footer.care') }}</p>
            <ul>
                <li><a class="link-underline" href="{{ route('faq') }}">{{ t('footer.faqLink') }}</a></li>
                <li><a class="link-underline" href="{{ route('size-guide') }}">{{ t('pdp.sizeGuide') }}</a></li>
                <li><a class="link-underline" href="{{ route('contact') }}">{{ t('footer.contactLink') }}</a></li>
                <li><a class="link-underline" href="{{ route('order.lookup.form') }}">{{ t('footer.trackLink') }}</a></li>
                <li><a class="link-underline" href="{{ route('account.home') }}">{{ t('footer.accountLink') }}</a></li>
            </ul>
        </div>

        <div>
            <p class="eyebrow">{{ t('footer.letter') }}</p>
            <p>{{ t('footer.letterBody') }}</p>
            <form class="newsletter-form" method="POST" action="{{ route('newsletter') }}">
                @csrf
                <input class="field" type="email" name="email" required placeholder="you@example.com">
                <button class="btn btn-primary btn-sm" type="submit">{{ t('footer.join') }}</button>
            </form>
        </div>
    </div>

    <div class="legal">
        <div class="wrap">
            <p>© {{ date('Y') }} OSSZ Collections · Douala, Cameroon</p>
            <p>MTN MoMo · Orange Money · Visa · Mastercard</p>
        </div>
    </div>
</footer>
