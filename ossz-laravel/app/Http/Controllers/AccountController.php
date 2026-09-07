<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Address;
use App\Models\Product;
use App\Models\User;
use App\Models\Wishlist;
use App\Support\Auth;
use Illuminate\Http\Request;

/**
 * Customer account — port of src/app/account/** pages.
 */
class AccountController extends Controller
{
    private function user(): User
    {
        return User::findOrFail(session('user_id'));
    }

    public function index()
    {
        $user = $this->user();

        return view('account.home', [
            'user' => $user,
            'orders' => $user->orders()->with('items')->orderByDesc('created_at')->limit(5)->get(),
            'appointments' => Appointment::where('user_id', $user->id)->orderByDesc('slot_start')->limit(5)->get(),
        ]);
    }

    public function orders()
    {
        return view('account.orders', [
            'orders' => $this->user()->orders()->with('items')->orderByDesc('created_at')->get(),
        ]);
    }

    public function appointments()
    {
        return view('account.appointments', [
            'appointments' => Appointment::where('user_id', $this->user()->id)->orderByDesc('slot_start')->get(),
        ]);
    }

    public function cancelAppointment(Request $request)
    {
        Appointment::where('id', (int) $request->input('id'))
            ->where('user_id', session('user_id'))
            ->update(['status' => 'cancelled']);

        return back()->with('success', 'Appointment cancelled.');
    }

    public function addresses()
    {
        return view('account.addresses', [
            'addresses' => Address::where('user_id', session('user_id'))->get(),
        ]);
    }

    public function saveAddress(Request $request)
    {
        $validated = $request->validate([
            'id' => 'nullable|integer',
            'label' => 'nullable|string|max:60',
            'full_name' => 'required|string|max:120',
            'phone' => 'required|string|max:40',
            'city' => 'nullable|string|max:80',
            'area' => 'nullable|string|max:120',
            'street' => 'nullable|string|max:200',
            'notes' => 'nullable|string|max:500',
        ]);

        $userId = session('user_id');
        $values = [
            'user_id' => $userId,
            'label' => $validated['label'] ?? 'Home',
            'full_name' => $validated['full_name'],
            'phone' => $validated['phone'],
            'city' => $validated['city'] ?? 'Douala',
            'area' => $validated['area'] ?? '',
            'street' => $validated['street'] ?? '',
            'notes' => $validated['notes'] ?? '',
        ];

        if (! empty($validated['id'])) {
            Address::where('id', (int) $validated['id'])->where('user_id', $userId)->update($values);
        } else {
            Address::create($values);
        }

        return back()->with('success', 'Address saved.');
    }

    public function deleteAddress(Request $request)
    {
        Address::where('id', (int) $request->input('id'))
            ->where('user_id', session('user_id'))
            ->delete();

        return back()->with('success', 'Address removed.');
    }

    public function profile()
    {
        return view('account.profile', ['user' => $this->user()]);
    }

    public function updateProfile(Request $request)
    {
        $validated = $request->validate([
            'fullName' => 'nullable|string|max:120',
            'phone' => 'nullable|string|max:40',
            'password' => 'nullable|min:6|max:120',
        ]);

        $user = $this->user();
        $values = [
            'full_name' => $validated['fullName'] ?? $user->full_name,
            'phone' => $validated['phone'] ?? $user->phone,
        ];
        if (! empty($validated['password'])) {
            $values['password_hash'] = Auth::hashPassword($validated['password']);
        }
        $user->update($values);

        return back()->with('success', 'Your details have been saved.');
    }

    public function wishlist()
    {
        $rows = Wishlist::with('product.images')->where('user_id', session('user_id'))->orderByDesc('created_at')->get();

        return view('account.wishlist', ['rows' => $rows]);
    }

    public function toggleWishlist(Request $request)
    {
        $productId = (int) $request->input('product_id');
        $userId = session('user_id');
        $existing = Wishlist::where('user_id', $userId)->where('product_id', $productId)->first();
        if ($existing) {
            $existing->delete();

            return back()->with('success', 'Removed from your wishlist.');
        }
        Wishlist::create(['user_id' => $userId, 'product_id' => $productId]);

        return back()->with('success', 'Saved to your wishlist.');
    }
}
