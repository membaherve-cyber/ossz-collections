<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'name', 'slug', 'description', 'details', 'care_instructions',
        'name_fr', 'description_fr', 'details_fr', 'care_instructions_fr',
        'category_id', 'collection_id', 'base_price', 'is_published', 'is_featured',
        'popularity', 'seo_title', 'seo_description',
    ];

    protected $casts = [
        'base_price' => 'integer',
        'is_published' => 'boolean',
        'is_featured' => 'boolean',
        'popularity' => 'integer',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function collection()
    {
        return $this->belongsTo(Collection::class);
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function wishlistedBy()
    {
        return $this->belongsToMany(User::class, 'wishlists');
    }
}
