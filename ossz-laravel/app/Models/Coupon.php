<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    protected $fillable = [
        'code', 'type', 'value', 'expires_at', 'usage_limit', 'times_used', 'is_active',
    ];

    protected $casts = [
        'value' => 'integer',
        'usage_limit' => 'integer',
        'times_used' => 'integer',
        'is_active' => 'boolean',
        'expires_at' => 'datetime',
    ];
}
