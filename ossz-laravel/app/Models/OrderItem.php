<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id', 'variant_id', 'product_name', 'product_slug', 'variant_label',
        'image_url', 'quantity', 'unit_price',
    ];

    protected $casts = ['quantity' => 'integer', 'unit_price' => 'integer'];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
