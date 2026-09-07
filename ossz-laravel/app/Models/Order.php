<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'order_number', 'user_id', 'guest_email', 'guest_phone', 'customer_name',
        'status', 'subtotal', 'discount', 'delivery_fee', 'total', 'coupon_code',
        'payment_method', 'payment_status', 'delivery_method', 'delivery_zone',
        'shipping_snapshot', 'payment_proof_url', 'notes',
    ];

    protected $casts = [
        'subtotal' => 'integer',
        'discount' => 'integer',
        'delivery_fee' => 'integer',
        'total' => 'integer',
        'shipping_snapshot' => 'array',
        'payment_proof_url' => 'string',
    ];

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }
}
