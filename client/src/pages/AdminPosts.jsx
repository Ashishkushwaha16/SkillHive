import { useEffect, useState } from "react";
import PageLayout from "../components/PageLayout";
import { createHomePost, getHomePosts } from "../services/userService";

const AdminPosts = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: "", text: "" });

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await getHomePosts();
      setPosts(Array.isArray(data) ? data : []);
    } catch (error) {
      setStatus({ type: "error", text: error.message || "Failed to load posts" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const cleanTitle = title.trim();
    const cleanDescription = description.trim();

    if (cleanTitle.length < 3) {
      setStatus({ type: "error", text: "Title must be at least 3 characters" });
      return;
    }

    if (cleanDescription.length < 10) {
      setStatus({ type: "error", text: "Description must be at least 10 characters" });
      return;
    }

    try {
      setSubmitting(true);
      await createHomePost({ title: cleanTitle, description: cleanDescription });
      setTitle("");
      setDescription("");
      setStatus({ type: "success", text: "Post published successfully" });
      await loadPosts();
    } catch (error) {
      setStatus({ type: "error", text: error.message || "Failed to create post" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageLayout
      title="Admin Posts"
      subtitle="Create and publish home feed posts directly from the admin panel."
    >
      <section className="rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-[0_16px_50px_-24px_rgba(15,23,42,0.22)] backdrop-blur">
        <div className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
          Composer
        </div>
        <h2 className="mt-3 text-xl font-bold text-slate-900">Create Home Feed Post</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label htmlFor="post-title" className="mb-1 block text-sm font-semibold text-slate-700">
              Title
            </label>
            <input
              id="post-title"
              type="text"
              className="ui-input"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Post title"
              maxLength={120}
              required
            />
          </div>

          <div>
            <label htmlFor="post-description" className="mb-1 block text-sm font-semibold text-slate-700">
              Description
            </label>
            <textarea
              id="post-description"
              className="ui-input resize-none"
              rows={6}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Write a useful announcement for users"
              maxLength={2000}
              required
            />
          </div>

          <button type="submit" className="ui-btn-primary" disabled={submitting}>
            {submitting ? "Publishing..." : "Publish Post"}
          </button>
        </form>

        {status.text ? (
          <p className={`mt-4 text-sm ${status.type === "success" ? "text-emerald-700" : "text-rose-700"}`}>
            {status.text}
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-3xl border border-slate-100 bg-gradient-to-br from-white via-slate-50/60 to-white p-6 shadow-[0_16px_50px_-24px_rgba(15,23,42,0.22)] backdrop-blur">
        <h2 className="text-xl font-bold text-slate-900">Published Posts</h2>
        {loading ? <p className="mt-3 text-sm text-slate-600">Loading posts...</p> : null}

        {!loading && posts.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">No posts published yet.</p>
        ) : null}

        <div className="mt-4 space-y-4">
          {posts.map((post) => (
            <article key={post._id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900">{post.title}</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{post.description}</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                Posted {new Date(post.createdAt).toLocaleString()}
              </p>
            </article>
          ))}
        </div>
      </section>
    </PageLayout>
  );
};

export default AdminPosts;
