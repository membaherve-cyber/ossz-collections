<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AiGap extends Model
{
    protected $fillable = [
        'session_id', 'question', 'locale', 'detected_intent', 'search_performed',
        'search_result', 'reason', 'resolved_answer', 'resolved_by', 'status',
    ];

    protected $casts = ['status' => 'string'];
}
