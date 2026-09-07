<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    protected $fillable = [
        'reference', 'user_id', 'guest_name', 'guest_contact', 'service',
        'slot_start', 'slot_end', 'status', 'notes',
    ];

    protected $casts = [
        'slot_start' => 'datetime',
        'slot_end' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
