<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Media extends Model
{
    protected $fillable = ['url', 'alt_text', 'tags', 'uploaded_by'];
}
