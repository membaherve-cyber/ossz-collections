<?php

namespace App\Support;

/**
 * Human-readable labels, ported from src/lib/utils.ts.
 */
final class Labels
{
    public const STATUS = [
        'placed' => 'Placed',
        'processing' => 'Processing',
        'ready' => 'Ready',
        'out_for_delivery' => 'Out for delivery',
        'delivered' => 'Delivered',
        'returned' => 'Returned',
        'cancelled' => 'Cancelled',
        'requested' => 'Requested',
        'confirmed' => 'Confirmed',
        'completed' => 'Completed',
        'pending' => 'Pending',
        'paid' => 'Paid',
        'draft' => 'Draft',
        'published' => 'Published',
    ];

    public const PAYMENT = [
        'mobile_money_mtn' => 'MTN Mobile Money',
        'mobile_money_orange' => 'Orange Money',
        'card' => 'Card (Visa / Mastercard)',
        'cash_on_delivery' => 'Cash or MoMo on delivery',
    ];

    public const DELIVERY = [
        'douala_local' => 'Douala local delivery',
        'national' => 'National shipping',
        'pickup' => 'In-store pickup',
    ];

    public static function status(string $status): string
    {
        return self::STATUS[$status] ?? $status;
    }

    public static function payment(string $method): string
    {
        return self::PAYMENT[$method] ?? $method;
    }

    public static function delivery(string $method): string
    {
        return self::DELIVERY[$method] ?? $method;
    }
}
