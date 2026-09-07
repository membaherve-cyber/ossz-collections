<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeliveryZone extends Model
{
    protected $fillable = [
        'name', 'method', 'fee', 'eta_label', 'name_fr', 'eta_label_fr', 'is_active',
    ];

    protected $casts = ['fee' => 'integer', 'is_active' => 'boolean'];
}
