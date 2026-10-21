
import { useEffect, useState } from "react";
import { Activity, Clock, UserRound, CircleDot } from "lucide-react";

function ActivityPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadActivities() {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          "http://localhost:8383/api/issues/activity",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load activity.");
        }

        setActivities(data.activities || []);
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    loadActivities();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 text-slate-300">
        Loading activity...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100 md:p-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-xl bg-violet-500/15 p-3 text-violet-400">
            <Activity size={24} />
          </div>

          <div>
            <h1 className="text-3xl font-bold">Activity</h1>
            <p className="mt-1 text-sm text-slate-400">
              See what's happening across your projects.
            </p>
          </div>
        </div>

        {activities.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-10 text-center">
            <Clock size={32} className="mx-auto mb-3 text-slate-500" />
            <h2 className="text-lg font-semibold">No activity yet</h2>
            <p className="mt-2 text-sm text-slate-400">
              Updates to issues in your projects will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
            {activities.map((item, index) => (
              <div
                key={item.id}
                className={`flex gap-4 p-5 ${
                  index !== activities.length - 1
                    ? "border-b border-slate-800"
                    : ""
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-800 text-violet-400">
                  <UserRound size={18} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-200">
                    {item.User?.name || "Someone"}
                  </p>

                  <p className="mt-1 text-sm text-slate-300">
                    {item.description}
                  </p>

                  {item.Issue?.title && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                      <CircleDot size={14} />
                      <span>{item.Issue.title}</span>
                    </div>
                  )}

                  <p className="mt-2 text-xs text-slate-500">
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleString()
                      : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ActivityPage;
