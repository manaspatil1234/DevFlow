
import { useEffect, useState } from "react";

function IssuesPage() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  useEffect(() => {
    async function loadMyIssues() {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");

        if (!token || !savedUser) {
          throw new Error("Please log in again.");
        }

        const user = JSON.parse(savedUser);

        const response = await fetch(
          "http://localhost:8383/api/issues",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load issues.");
        }

        
const myIssues = (data.issues || []).filter((issue) => {
  const isAssignedToMe =
    Number(issue.assigneeId) === Number(user.id);

  const isCreatedByMe =
    Number(issue.createdById) === Number(user.id);

  return isAssignedToMe || isCreatedByMe;
});

setIssues(myIssues);

      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    loadMyIssues();
  }, []);

  const filteredIssues = issues.filter((issue) => {
    const matchesStatus =
      statusFilter === "all" || issue.status === statusFilter;

    const matchesPriority =
      priorityFilter === "all" || issue.priority === priorityFilter;

    return matchesStatus && matchesPriority;
  });

  if (loading) {
    return <div className="p-6 text-slate-300">Loading your issues...</div>;
  }

  if (error) {
    return <div className="p-6 text-rose-400">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-[#0b0b10] p-6 text-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">My Issues</h1>
          <p className="mt-2 text-slate-400">
            Issues you've created or that are assigned to you.
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
          <p className="text-sm text-slate-400">Assigned to you</p>
          <p className="mt-1 text-2xl font-bold text-white">
            {issues.length}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-lg border border-white/10 bg-[#111118] px-3 py-2 text-white"
        >
          <option value="all">All statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="in_review">In Review</option>
          <option value="resolved">Resolved</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(event) => setPriorityFilter(event.target.value)}
          className="rounded-lg border border-white/10 bg-[#111118] px-3 py-2 text-white"
        >
          <option value="all">All priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {filteredIssues.length === 0 ? (
        <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center">
          <h2 className="font-semibold text-white">No issues found</h2>
          <p className="mt-2 text-sm text-slate-400">
            {issues.length === 0
              ? "No issues are currently assigned to you."
              : "Try changing your status or priority filters."}
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredIssues.map((issue) => (
            <div
              key={issue.id}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-5"
            >
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-md bg-white/10 px-2 py-1">
                  {issue.status}
                </span>

                <span className="rounded-md bg-indigo-500/15 px-2 py-1 text-indigo-300">
                  {issue.priority}
                </span>

                <span className="rounded-md bg-white/10 px-2 py-1">
                  {issue.type}
                </span>
              </div>

              <h2 className="mt-4 font-semibold text-white">
                {issue.title}
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                {issue.description || "No description provided."}
              </p>

              <div className="mt-4 border-t border-white/10 pt-3 text-sm">
                <p className="text-slate-400">
                  Project:{" "}
                  <span className="text-slate-200">
                    {issue.project?.name ||
                      issue.Project?.name ||
                      `Project #${issue.projectId}`}
                  </span>
                </p>

                <p className="mt-2 text-slate-400">
                  Due date:{" "}
                  <span className="text-slate-200">
                    {issue.dueDate || "Not set"}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default IssuesPage;
