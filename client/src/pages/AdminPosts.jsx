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
      <section className="ui-card p-6">
        <h2 className="text-xl font-bold text-slate-900">Create Home Feed Post</h2>
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

      <section className="ui-card mt-6 p-6">
        <h2 className="text-xl font-bold text-slate-900">Published Posts</h2>
        {loading ? <p className="mt-3 text-sm text-slate-600">Loading posts...</p> : null}

        {!loading && posts.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">No posts published yet.</p>
        ) : null}

        <div className="mt-4 space-y-4">
          {posts.map((post) => (
            <article key={post._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
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
