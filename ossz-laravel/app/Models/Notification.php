<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = ['order_id', 'appointment_id', 'channel', 'recipient', 'subject', 'body', 'status', 'error'];
    public function order() { return $this->belongsTo(Order::class); }
}
