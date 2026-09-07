<?php

namespace App\Support;

/**
 * Authentication glue, ported from src/lib/auth.ts.
 *
 * Password hashes use the same "salt:derived" scrypt scheme as the Next.js
 * app, so an existing database keeps working with no re-hash migration.
 */
final class Auth
{
    public const RANK = ['customer' => 0, 'uploader' => 1, 'staff' => 2, 'admin' => 3];

    public static function hashPassword(string $password): string
    {
        $salt = bin2hex(random_bytes(16));
        $derived = hash('scrypt', $password, $salt, 64);

        return $salt.':'.$derived;
    }

    /** Verify against "salt:hex" scrypt hashes (and bcrypt for Laravel seeds). */
    public static function verifyPassword(string $password, string $stored): bool
    {
        // Laravel-seeded accounts (Hash::make) use bcrypt.
        if (str_starts_with($stored, '$2y$') || str_starts_with($stored, '$2a$')) {
            return password_verify($password, $stored);
        }
        $parts = explode(':', $stored);
        if (count($parts) !== 2) {
            return false;
        }
        [$salt, $key] = $parts;
        $derived = hash('scrypt', $password, $salt, 64);

        return hash_equals($key, $derived);
    }

    public static function hasAtLeast(?string $role, string $minimum): bool
    {
        $role = $role ?? 'customer';

        return (self::RANK[$role] ?? 0) >= (self::RANK[$minimum] ?? 0);
    }

    public static function canEnterBackOffice(?string $role): bool
    {
        return in_array($role, ['uploader', 'staff', 'admin'], true);
    }

    public static function canManageCatalogue(?string $role): bool
    {
        return in_array($role, ['uploader', 'admin'], true);
    }

    public static function canFulfilOrders(?string $role): bool
    {
        return in_array($role, ['staff', 'admin'], true);
    }

    public static function isAdmin(?string $role): bool
    {
        return $role === 'admin';
    }
}
