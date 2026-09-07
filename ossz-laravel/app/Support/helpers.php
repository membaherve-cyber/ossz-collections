<?php

/* ------------------------------------------------------------------ *
 *  OSSZ Collections — global helpers.
 *
 *  Ported from the Next.js implementation:
 *    src/lib/utils.ts        (formatting, order numbers, labels)
 *    src/lib/i18n.ts         (t / pick for EN-FR copy)
 *    src/lib/i18n-pages.ts   (page-level copy)
 * ------------------------------------------------------------------ */

use App\Support\I18n;
use App\Support\Cart;
use Illuminate\Support\Facades\Auth;

if (! function_exists('format_xaf')) {
    /** Format an integer FCFA amount: "185 000 FCFA". */
    function format_xaf(int|float|null $amount): string
    {
        $rounded = (int) round($amount ?? 0);
        return number_format($rounded, 0, ',', ' ') . ' FCFA';
    }
}

if (! function_exists('make_order_number')) {
    /** OSZ-XXXXXYYY — same shape as the Next.js shop. */
    function make_order_number(): string
    {
        $stamp = strtoupper(substr(base_convert((string) time(), 10, 36), -5));
        $rand = strtoupper(str_pad(base_convert((string) random_int(0, 46655), 10, 36), 3, '0', STR_PAD_LEFT));
        return "OSZ-{$stamp}{$rand}";
    }
}

if (! function_exists('make_reference')) {
    /** APT-XXXX style reference codes for appointments. */
    function make_reference(string $prefix): string
    {
        $rand = strtoupper(str_pad(base_convert((string) random_int(0, 1679615), 10, 36), 4, '0', STR_PAD_LEFT));
        return "{$prefix}-{$rand}";
    }
}

if (! function_exists('slugify')) {
    /** Transliterate + dash-case, identical output to src/lib/utils.ts. */
    function slugify(string $input): string
    {
        $transliterated = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $input) ?: $input;
        $slug = strtolower(preg_replace('/[^a-z0-9]+/i', '-', $transliterated) ?? '');
        return substr(trim($slug, '-'), 0, 70);
    }
}

if (! function_exists('wa_link')) {
    /** wa.me deep link carrying a prefilled message. */
    function wa_link(?string $to, ?string $text = null): string
    {
        $digits = preg_replace('/\D/', '', $to ?? '') ?? '';
        $link = 'https://wa.me/' . $digits;
        return $text ? $link . '?text=' . rawurlencode($text) : $link;
    }
}

if (! function_exists('locale')) {
    /** The visitor's locale, resolved from the cookie (en | fr). */
    function locale(): string
    {
        return I18n::locale();
    }
}

if (! function_exists('t')) {
    /** Translate an interface/page key for the current locale. */
    function t(string $key, array $vars = []): string
    {
        return I18n::t($key, $vars);
    }
}

if (! function_exists('pick')) {
    /** Prefer the French copy when browsing in FR and a translation exists. */
    function pick(?string $en, ?string $fr = null): string
    {
        return I18n::pick($en, $fr);
    }
}

if (! function_exists('is_fr')) {
    function is_fr(): bool
    {
        return I18n::locale() === 'fr';
    }
}

if (! function_exists('cart')) {
    /** The current visitor's cart view (lines, subtotal, coupon, discount). */
    function cart(): array
    {
        return Cart::view();
    }
}

if (! function_exists('current_user')) {
    /** The signed-in user model, or null. */
    function current_user(): ?App\Models\User
    {
        if (Auth::check()) {
            return Auth::user();
        }
        $id = session('user_id');
        return $id ? App\Models\User::find($id) : null;
    }
}

if (! function_exists('setting')) {
    /** Read a settings-table value with the Next.js defaults as fallback. */
    function setting(string $key, ?string $fallback = null): ?string
    {
        return App\Support\Settings::get($key, $fallback);
    }
}

if (! function_exists('settings_all')) {
    function settings_all(): array
    {
        return App\Support\Settings::all();
    }
}

if (! function_exists('status_label')) {
    function status_label(string $status): string
    {
        return App\Support\Labels::status($status);
    }
}

if (! function_exists('payment_label')) {
    function payment_label(string $method): string
    {
        return App\Support\Labels::payment($method);
    }
}

if (! function_exists('delivery_label')) {
    function delivery_label(string $method): string
    {
        return App\Support\Labels::delivery($method);
    }
}

if (! function_exists('format_date')) {
    function format_date($value): string
    {
        if (! $value) return '—';
        $date = $value instanceof DateTime ? $value : new DateTime((string) $value);
        return $date->format('d M Y');
    }
}

if (! function_exists('format_date_time')) {
    function format_date_time($value): string
    {
        if (! $value) return '—';
        $date = $value instanceof DateTime ? $value : new DateTime((string) $value);
        return $date->format('d M Y · H:i');
    }
}
