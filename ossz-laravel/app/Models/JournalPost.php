<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JournalPost extends Model
{
    protected $fillable = [
        'title', 'slug', 'excerpt', 'body', 'cover_image',
        'title_fr', 'excerpt_fr', 'body_fr', 'author_name', 'status', 'published_at',
    ];

    protected $casts = ['published_at' => 'datetime'];
}
