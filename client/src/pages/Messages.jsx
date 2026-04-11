import { useEffect, useState } from "react";
import PageLayout from "../components/PageLayout";
import { getMessages } from "../services/userService";

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const data = await getMessages();
        setMessages(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, []);

  return (
    <PageLayout
      title="Contact Messages"
      subtitle="Messages submitted through the public contact form."
    >
      <div className="ui-card p-6">
        {loading ? <p className="text-slate-600">Loading messages...</p> : null}
        {error ? <p className="text-red-600">{error}</p> : null}

        {!loading && !error ? (
          messages.length ? (
            <div className="space-y-4">
              {messages.map((item) => (
                <div
                  key={item._id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      {item.subject}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <p className="mt-1 text-sm text-slate-700">
                    From: <span className="font-semibold">{item.name}</span> ({item.email})
                  </p>

                  <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">
                    {item.message}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-600">No messages found.</p>
          )
        ) : null}
      </div>
    </PageLayout>
  );
};

export default Messages;
