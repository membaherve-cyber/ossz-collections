<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $fillable = [
        'name', 'name_fr', 'slug', 'parent_id', 'sort_order',
    ];

    public function parent()
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
