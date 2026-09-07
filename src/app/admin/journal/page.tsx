import { desc } from "drizzle-orm";
import { db } from "@/db";
import { journalPosts } from "@/db/schema";
import { saveJournalAction } from "@/lib/admin-actions";
import { ActionForm } from "@/components/action-form";
import { formatDate } from "@/lib/utils";

import { guardPage } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function AdminJournal() {
  await guardPage("catalogue");
  const posts = await db.select().from(journalPosts).orderBy(desc(journalPosts.createdAt));
  return (
    <div>
      <h1 className="display text-3xl">Journal</h1>
      <p className="mt-2 text-sm text-ink-soft">Write an entry, save it as a draft, and publish when you are ready.</p>

      <details className="card mt-6 p-6">
        <summary className="cursor-pointer text-sm font-medium">+ New entry</summary>
        <ActionForm action={saveJournalAction} submitLabel="Save entry" className="mt-5 grid gap-4">
          <div><label className="label" htmlFor="title">Title</label><input id="title" name="title" required className="field" /></div>
          <div><label className="label" htmlFor="excerpt">Short summary</label><input id="excerpt" name="excerpt" className="field" /></div>
          <div><label className="label" htmlFor="coverImage">Cover photo link</label><input id="coverImage" name="coverImage" className="field" /></div>
          <div><label className="label" htmlFor="body">Body — leave a blank line between paragraphs</label><textarea id="body" name="body" rows={8} className="field" /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label" htmlFor="authorName">Author</label><input id="authorName" name="authorName" defaultValue="OSSZ Studio" className="field" /></div>
            <div>
              <label className="label" htmlFor="status">Status</label>
              <select id="status" name="status" className="field"><option value="draft">Draft</option><option value="published">Published</option></select>
            </div>
          </div>
        </ActionForm>
      </details>

      <div className="mt-8 space-y-4">
        {posts.map((post) => (
          <details key={post.id} className="card p-5">
            <summary className="cursor-pointer text-sm font-medium">
              {post.title} <span className="text-xs text-muted">· {post.status} · {formatDate(post.publishedAt ?? post.createdAt)}</span>
            </summary>
            <ActionForm action={saveJournalAction} submitLabel="Save" className="mt-4 grid gap-4">
              <input type="hidden" name="id" value={post.id} />
              <input type="hidden" name="slug" value={post.slug} />
              <div><label className="label" htmlFor={`t${post.id}`}>Title</label><input id={`t${post.id}`} name="title" defaultValue={post.title} className="field" /></div>
              <div><label className="label" htmlFor={`x${post.id}`}>Summary</label><input id={`x${post.id}`} name="excerpt" defaultValue={post.excerpt} className="field" /></div>
              <div><label className="label" htmlFor={`c${post.id}`}>Cover photo link</label><input id={`c${post.id}`} name="coverImage" defaultValue={post.coverImage} className="field" /></div>
              <div><label className="label" htmlFor={`b${post.id}`}>Body</label><textarea id={`b${post.id}`} name="body" rows={8} defaultValue={post.body} className="field" /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="label" htmlFor={`a${post.id}`}>Author</label><input id={`a${post.id}`} name="authorName" defaultValue={post.authorName} className="field" /></div>
                <div>
                  <label className="label" htmlFor={`s${post.id}`}>Status</label>
                  <select id={`s${post.id}`} name="status" defaultValue={post.status} className="field">
                    <option value="draft">Draft</option><option value="published">Published</option>
                  </select>
                </div>
              </div>
            </ActionForm>
          </details>
        ))}
      </div>
    </div>
  );
}
