<?php

namespace App\Support;

/**
 * Locale resolution + EN/FR dictionary.
 *
 * Ported from src/lib/i18n.ts and src/lib/i18n-pages.ts. The cookie name
 * matches the Next.js app so a shared visitor keeps their language.
 */
final class I18n
{
    public const COOKIE = 'ossz_locale';

    private static ?string $resolved = null;

    private static ?array $cache = null;

    public static function locale(): string
    {
        if (self::$resolved !== null) {
            return self::$resolved;
        }
        $value = $_COOKIE[self::COOKIE] ?? request()->cookie(self::COOKIE);
        self::$resolved = ($value === 'fr') ? 'fr' : 'en';

        return self::$resolved;
    }

    public static function pick(?string $en, ?string $fr = null): string
    {
        if (self::locale() === 'fr' && $fr !== null && trim($fr) !== '') {
            return $fr;
        }

        return $en ?? '';
    }

    public static function t(string $key, array $vars = []): string
    {
        $value = self::lines()[$key] ?? null;
        if ($value === null) {
            return $key;
        }
        foreach ($vars as $k => $v) {
            $value = str_replace('{'.$k.'}', (string) $v, $value);
        }

        return $value;
    }

    private static function lines(): array
    {
        if (self::$cache !== null) {
            return self::$cache;
        }
        $path = config_path('ossz-i18n.php');
        self::$cache = is_file($path) ? require $path : [];

        return self::$cache;
    }
}
