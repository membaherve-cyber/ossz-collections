<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'order_number', 'user_id', 'guest_email', 'guest_phone', 'customer_name',
        'status', 'subtotal', 'discount', 'delivery_fee', 'total', 'coupon_code',
        'payment_method', 'payment_status', 'delivery_method', 'delivery_zone',
        'shipping_snapshot', 'notes', 'updated_at',
    ];
    protected $casts = [
        'subtotal' => 'integer', 'discount' => 'integer', 'delivery_fee' => 'integer',
        'total' => 'integer', 'shipping_snapshot' => 'array',
        'created_at' => 'datetime', 'updated_at' => 'datetime',
    ];

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function items(): HasMany { return $this->hasMany(OrderItem::class); }
    public function notifications(): HasMany { return $this->hasMany(Notification::class); }

    const STATUSES = ['placed', 'processing', 'ready', 'out_for_delivery', 'delivered', 'returned', 'cancelled'];
    const STATUS_LABELS = [
        'placed' => 'Placed', 'processing' => 'Processing', 'ready' => 'Ready for pickup',
        'out_for_delivery' => 'Out for delivery', 'delivered' => 'Delivered',
        'returned' => 'Returned', 'cancelled' => 'Cancelled',
    ];
}
