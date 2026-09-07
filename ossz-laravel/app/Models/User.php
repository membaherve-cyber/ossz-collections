<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    protected $table = 'users';

    protected $fillable = [
        'email', 'username', 'phone', 'full_name', 'password_hash', 'role',
    ];

    protected $hidden = ['password_hash'];

    public function getAuthPassword(): string
    {
        return $this->password_hash;
    }

    public function addresses()
    {
        return $this->hasMany(Address::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
