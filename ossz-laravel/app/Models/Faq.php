<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Faq extends Model
{
    protected $fillable = [
        'category', 'question', 'answer', 'category_fr', 'question_fr', 'answer_fr', 'sort_order',
    ];

    protected $casts = ['sort_order' => 'integer'];
}
