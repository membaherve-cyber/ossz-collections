<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AiConversation extends Model
{
    protected $fillable = [
        'user_id', 'session_id', 'transcript', 'escalated_to_whatsapp',
    ];

    protected $casts = [
        'transcript' => 'array',
        'escalated_to_whatsapp' => 'boolean',
    ];
}
