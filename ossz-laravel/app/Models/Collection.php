<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Collection extends Model
{
    protected $fillable = ['name', 'slug', 'description', 'cover_image', 'season', 'name_fr', 'description_fr', 'season_fr', 'is_featured', 'is_published'];
    protected $casts = ['is_featured' => 'boolean', 'is_published' => 'boolean'];
    public function products() { return $this->hasMany(Product::class); }
}
