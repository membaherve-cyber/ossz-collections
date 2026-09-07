<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    protected $fillable = ['actor_id', 'actor_email', 'action', 'detail'];
}
