<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use App\Models\HomeBlock;
use App\Models\JournalPost;
use App\Models\LookbookItem;

class ContentController extends Controller
{
    public function homepage()
    {
        $this->guard();

        return view('admin.homepage', [
            'blocks' => HomeBlock::orderBy('sort_order')->get(),
        ]);
    }

    public function saveHomeBlock(\Illuminate\Http\Request $request)
    {
        $this->guard();
        $data = $request->validate([
            'id' => 'nullable|integer',
            'type' => 'required|in:hero,banner,quote,editorial',
            'eyebrow' => 'nullable|string|max:120',
            'heading' => 'nullable|string|max:240',
            'body' => 'nullable|string|max:2000',
            'image_url' => 'nullable|string|max:400',
            'cta_label' => 'nullable|string|max:80',
            'eyebrow_fr' => 'nullable|string|max:120',
            'heading_fr' => 'nullable|string|max:240',
            'body_fr' => 'nullable|string|max:2000',
            'cta_label_fr' => 'nullable|string|max:80',
            'cta_href' => 'nullable|string|max:200',
            'sort_order' => 'nullable|integer',
        ]);
        $data['is_published'] = $request->boolean('is_published');
        if (! empty($data['id'])) {
            HomeBlock::where('id', (int) $data['id'])->update($data);
        } else {
            unset($data['id']);
            HomeBlock::create($data);
        }

        return back()->with('success', 'Home block saved.');
    }

    public function deleteHomeBlock(\Illuminate\Http\Request $request)
    {
        $this->guard();
        HomeBlock::where('id', (int) $request->input('id'))->delete();

        return back()->with('success', 'Home block removed.');
    }

    public function journal()
    {
        $this->guard();

        return view('admin.journal', [
            'posts' => JournalPost::orderByDesc('created_at')->get(),
        ]);
    }

    public function savePost(\Illuminate\Http\Request $request)
    {
        $this->guard();
        $data = $request->validate([
            'id' => 'nullable|integer',
            'title' => 'required|string|max:200',
            'slug' => 'nullable|string|max:220',
            'excerpt' => 'nullable|string|max:600',
            'body' => 'nullable|string|max:40000',
            'cover_image' => 'nullable|string|max:400',
            'title_fr' => 'nullable|string|max:200',
            'excerpt_fr' => 'nullable|string|max:600',
            'body_fr' => 'nullable|string|max:40000',
            'author_name' => 'nullable|string|max:120',
            'status' => 'required|in:draft,published',
        ]);
        $data['slug'] = slugify($data['slug'] ?: $data['title']);
        if (($data['status'] ?? '') === 'published') {
            $data['published_at'] = now();
        }
        if (! empty($data['id'])) {
            JournalPost::where('id', (int) $data['id'])->update($data);
        } else {
            unset($data['id']);
            JournalPost::create($data);
        }

        return back()->with('success', 'Journal entry saved.');
    }

    public function deletePost(\Illuminate\Http\Request $request)
    {
        $this->guard();
        JournalPost::where('id', (int) $request->input('id'))->delete();

        return back()->with('success', 'Journal entry deleted.');
    }

    public function lookbook()
    {
        $this->guard();

        return view('admin.lookbook', [
            'looks' => LookbookItem::orderBy('sort_order')->get(),
        ]);
    }

    public function saveLook(\Illuminate\Http\Request $request)
    {
        $this->guard();
        $data = $request->validate([
            'id' => 'nullable|integer',
            'title' => 'nullable|string|max:200',
            'caption' => 'nullable|string|max:600',
            'caption_fr' => 'nullable|string|max:600',
            'image_url' => 'required|string|max:400',
            'media_type' => 'required|in:image,video',
            'video_url' => 'nullable|string|max:400',
            'poster_url' => 'nullable|string|max:400',
            'duration_seconds' => 'nullable|integer',
            'product_slug' => 'nullable|string|max:220',
            'sort_order' => 'nullable|integer',
        ]);
        if (! empty($data['id'])) {
            LookbookItem::where('id', (int) $data['id'])->update($data);
        } else {
            unset($data['id']);
            LookbookItem::create($data);
        }

        return back()->with('success', 'Look saved.');
    }

    /** Video upload → storage/app/lookbook. */
    public function uploadLook(\Illuminate\Http\Request $request)
    {
        $this->guard();
        $request->validate([
            'video' => 'required|file|mimetypes:video/mp4,video/webm,video/quicktime|max:102400',
        ]);
        $path = $request->file('video')->store('lookbook', 'local_custom');

        return back()->with('success', 'Video uploaded.')->with('uploaded_path', $path);
    }

    public function deleteLook(\Illuminate\Http\Request $request)
    {
        $this->guard();
        LookbookItem::where('id', (int) $request->input('id'))->delete();

        return back()->with('success', 'Look deleted.');
    }

    public function faqs()
    {
        $this->guard();

        return view('admin.faqs', [
            'faqs' => Faq::orderBy('sort_order')->get(),
        ]);
    }

    public function saveFaq(\Illuminate\Http\Request $request)
    {
        $this->guard();
        $data = $request->validate([
            'id' => 'nullable|integer',
            'category' => 'nullable|string|max:80',
            'category_fr' => 'nullable|string|max:80',
            'question' => 'required|string|max:400',
            'answer' => 'required|string|max:4000',
            'question_fr' => 'nullable|string|max:400',
            'answer_fr' => 'nullable|string|max:4000',
            'sort_order' => 'nullable|integer',
        ]);
        if (! empty($data['id'])) {
            Faq::where('id', (int) $data['id'])->update($data);
        } else {
            unset($data['id']);
            Faq::create($data);
        }

        return back()->with('success', 'FAQ saved.');
    }

    public function deleteFaq(\Illuminate\Http\Request $request)
    {
        $this->guard();
        Faq::where('id', (int) $request->input('id'))->delete();

        return back()->with('success', 'FAQ deleted.');
    }

    private function guard(): void
    {
        $user = request()->attributes->get('ossz_user');
        if (! \App\Support\Auth::isAdmin($user->role)) {
            abort(redirect()->route('admin.dashboard')->with('error', 'Admins only.'));
        }
    }
}
