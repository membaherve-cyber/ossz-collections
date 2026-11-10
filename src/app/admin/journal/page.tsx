import { desc } from "drizzle-orm";
import { db } from "@/db";
import { journalPosts } from "@/db/schema";
import { saveJournalAction } from "@/lib/admin-actions";
import { ActionForm } from "@/components/action-form";
import { ImageUploadControl } from "@/components/admin/image-upload-control";
import { formatDate } from "@/lib/utils";
import { guardPage } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function AdminJournal() {
  await guardPage("catalogue");
  const posts = await db.select().from(journalPosts).orderBy(desc(journalPosts.createdAt));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs uppercase tracking-widest text-accent font-semibold">Content</span>
          <h1 className="display text-3xl font-medium tracking-tight text-ink mt-0.5">Journal</h1>
          <p className="mt-1 text-sm text-ink-soft">Write editorial stories, artisanal craftsmanship notes, and brand announcements.</p>
        </div>
      </div>

      <details className="group rounded-2xl border border-line bg-paper p-6 shadow-xs transition-all hover:border-accent/30">
        <summary className="flex cursor-pointer items-center justify-between text-sm font-medium text-ink select-none">
          <span className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10 text-accent font-semibold">+</span>
            <span>Write new journal entry</span>
          </span>
          <span className="text-xs text-muted group-open:rotate-180 transition-transform">▼</span>
        </summary>
        <ActionForm action={saveJournalAction} submitLabel="Publish or save entry" className="mt-6 grid gap-5 pt-4 border-t border-line/60">
          <div>
            <label className="label" htmlFor="title">Entry title</label>
            <input id="title" name="title" required className="field rounded-xl" placeholder="e.g. The Craft of Handwoven Cashmere" />
          </div>
          <div>
            <label className="label" htmlFor="excerpt">Short summary / Standfirst</label>
            <input id="excerpt" name="excerpt" className="field rounded-xl" placeholder="A single compelling sentence shown on cards and previews." />
          </div>
          <div>
            <ImageUploadControl id="coverImage" name="coverImage" folder="journal" label="Editorial cover image" helpText="Upload via ImageKit or paste an existing link." />
          </div>
          <div>
            <label className="label" htmlFor="body">Body (markdown / paragraphs with blank line separators)</label>
            <textarea id="body" name="body" rows={8} className="field rounded-xl font-mono text-xs leading-relaxed" placeholder="Write your story here..." />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="authorName">Author name</label>
              <input id="authorName" name="authorName" defaultValue="OSSZ Studio" className="field rounded-xl" />
            </div>
            <div>
              <label className="label" htmlFor="status">Publication status</label>
              <select id="status" name="status" className="field rounded-xl">
                <option value="draft">Draft (hidden from journal)</option>
                <option value="published">Published (live immediately)</option>
              </select>
            </div>
          </div>
        </ActionForm>
      </details>

      <div className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">Journal Articles ({posts.length})</h2>
        {posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-paper/40 p-12 text-center text-sm text-muted">
            No journal entries yet. Click "+ Write new journal entry" above to draft your first story.
          </div>
        ) : null}
        {posts.map((post) => (
          <details key={post.id} className="group rounded-2xl border border-line bg-paper p-5 shadow-xs transition-all hover:border-accent/30">
            <summary className="flex cursor-pointer items-center justify-between text-sm font-medium text-ink select-none">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-line bg-accent-soft/30 flex items-center justify-center text-xs text-muted">
                  {post.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={post.coverImage} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span>OSSZ</span>
                  )}
                </div>
                <div>
                  <div className="font-medium text-ink flex items-center gap-2">
                    {post.title}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${post.status === "published" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
                      {post.status}
                    </span>
                  </div>
                  <div className="text-xs text-muted flex items-center gap-2 mt-0.5">
                    <span>by {post.authorName}</span>
                    <span>•</span>
                    <span>{formatDate(post.publishedAt ?? post.createdAt)}</span>
                    <span>•</span>
                    <span>/{post.slug}</span>
                  </div>
                </div>
              </div>
              <span className="text-xs text-muted group-open:rotate-180 transition-transform">▼</span>
            </summary>

            <ActionForm action={saveJournalAction} submitLabel="Save entry changes" className="mt-5 grid gap-5 pt-4 border-t border-line/60">
              <input type="hidden" name="id" value={post.id} />
              <input type="hidden" name="slug" value={post.slug} />
              <div>
                <label className="label" htmlFor={`t${post.id}`}>Title</label>
                <input id={`t${post.id}`} name="title" defaultValue={post.title} required className="field rounded-xl" />
              </div>
              <div>
                <label className="label" htmlFor={`x${post.id}`}>Summary</label>
                <input id={`x${post.id}`} name="excerpt" defaultValue={post.excerpt ?? ""} className="field rounded-xl" />
              </div>
              <div>
                <ImageUploadControl
                  id={`c${post.id}`}
                  name="coverImage"
                  defaultValue={post.coverImage}
                  folder="journal"
                  label="Editorial cover image"
                />
              </div>
              <div>
                <label className="label" htmlFor={`b${post.id}`}>Body</label>
                <textarea id={`b${post.id}`} name="body" rows={8} defaultValue={post.body ?? ""} className="field rounded-xl font-mono text-xs leading-relaxed" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor={`a${post.id}`}>Author</label>
                  <input id={`a${post.id}`} name="authorName" defaultValue={post.authorName ?? "OSSZ Studio"} className="field rounded-xl" />
                </div>
                <div>
                  <label className="label" htmlFor={`s${post.id}`}>Status</label>
                  <select id={`s${post.id}`} name="status" defaultValue={post.status} className="field rounded-xl">
                    <option value="draft">Draft (hidden from journal)</option>
                    <option value="published">Published (live immediately)</option>
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
