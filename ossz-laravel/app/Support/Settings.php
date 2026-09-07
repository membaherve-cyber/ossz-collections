<?php

namespace App\Support;

use App\Models\Setting;
use Illuminate\Support\Facades\Cache;

/**
 * Settings-table accessor with the same defaults the Next.js shop used.
 * Values are cached for a minute; admin writes clear the cache.
 */
final class Settings
{
    public const DEFAULTS = [
        'whatsapp_number' => '+237694068219',
        'whatsapp_number2' => '+237651468831',
        'store_address' => 'Ange Raphael, Douala, Cameroon',
        'business_hours' => 'Monday to Friday, 9:00am - 6pm. Saturday 9:00am - 1pm',
        'concierge_greeting' => 'Good day, and welcome to OSSZ Collections. I am the OSSZ Concierge — how may I assist you today?',
        'contact_email' => 'info@osszcollection.com',
        'cod_enabled' => 'false',
        'mobile_money_enabled' => 'true',
        'card_enabled' => 'true',
        'free_delivery_threshold' => '150000',
    ];

    private static ?array $cache = null;

    public static function get(string $key, ?string $fallback = null): ?string
    {
        $all = self::all();
        if (array_key_exists($key, $all)) {
            return $all[$key];
        }

        return $fallback ?? self::DEFAULTS[$key] ?? null;
    }

    /** @return array<string,string> defaults merged with DB rows. */
    public static function all(): array
    {
        if (self::$cache !== null) {
            return self::$cache;
        }
        try {
            $rows = Cache::remember('ossz.settings', 60, function () {
                return Setting::query()->pluck('value', 'key')->all();
            });
        } catch (\Throwable) {
            // Before migrations have run, keep serving defaults.
            $rows = [];
        }
        self::$cache = array_merge(self::DEFAULTS, $rows);

        return self::$cache;
    }

    public static function put(string $key, ?string $value): void
    {
        Setting::updateOrCreate(['key' => $key], ['value' => (string) $value]);
        self::flush();
    }

    public static function flush(): void
    {
        self::$cache = null;
        Cache::forget('ossz.settings');
    }
}
