<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HomeBlock extends Model
{
    protected $fillable = [
        'type', 'eyebrow', 'heading', 'body', 'image_url', 'cta_label',
        'eyebrow_fr', 'heading_fr', 'body_fr', 'cta_label_fr', 'cta_href',
        'sort_order', 'is_published',
    ];

    protected $casts = ['sort_order' => 'integer', 'is_published' => 'boolean'];
}
