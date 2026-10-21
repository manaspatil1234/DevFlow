
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

function ProjectDetailsPage() {
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [issues, setIssues] = useState([]);
  const [issuesLoading, setIssuesLoading] = useState(true);
  const [issuesError, setIssuesError] = useState("");const [members, setMembers] = useState([]);
const [assignmentError, setAssignmentError] = useState("");

const [dateDrafts, setDateDrafts] = useState({});
    const [commentsByIssue, setCommentsByIssue] = useState({});
const [commentDrafts, setCommentDrafts] = useState({});
const [commentsLoading, setCommentsLoading] = useState({});
const [commentErrors, setCommentErrors] = useState({});

  useEffect(() => {
    async function loadProject() {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          `http://localhost:8383/api/projects/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load project");
        }

        setProject(data.project);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, [id]);

    
useEffect(() => {
  async function loadIssues() {
    try {
      setIssuesLoading(true);
      setIssuesError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:8383/api/issues?projectId=${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load issues");
      }

      setIssues(data.issues || []);
    } catch (error) {
      setIssuesError(error.message);
    } finally {
      setIssuesLoading(false);
    }
  }

  loadIssues();
}, [id]);


useEffect(() => {
  async function loadMembers() {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:8383/api/projects/${id}/members`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load members");
      }

      setMembers(data.members || []);
    } catch (error) {
      console.error("Load members error:", error);
    }
  }

  loadMembers();
}, [id]);


async function handleAssignIssue(issueId, assigneeId) {
  try {
    setAssignmentError("");

    const token = localStorage.getItem("token");

    const response = await fetch(
      `http://localhost:8383/api/issues/${issueId}/assignee`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          assigneeId:
            assigneeId === "" ? null : Number(assigneeId),
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to assign issue");
    }

    setIssues((currentIssues) =>
      currentIssues.map((issue) =>
        issue.id === issueId
          ? { ...issue, assigneeId: data.issue.assigneeId }
          : issue
      )
    );
  } catch (error) {
    setAssignmentError(error.message);
  }
}


async function handleUpdateDueDate(issueId, selectedDate) {
  try {
    setAssignmentError("");

    const token = localStorage.getItem("token");

    const response = await fetch(
      `http://localhost:8383/api/issues/${issueId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          dueDate: selectedDate === "" ? null : selectedDate,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update due date");
    }

    setIssues((currentIssues) =>
      currentIssues.map((issue) =>
        issue.id === issueId
          ? { ...issue, dueDate: data.issue.dueDate }
          : issue
      )
    );
  } catch (error) {
    setAssignmentError(error.message);
  }
}


async function loadComments(issueId) {
  setCommentsLoading((current) => ({
    ...current,
    [issueId]: true,
  }));

  setCommentErrors((current) => ({
    ...current,
    [issueId]: "",
  }));

  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `http://localhost:8383/api/issues/${issueId}/comments`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load comments");
    }

    setCommentsByIssue((current) => ({
      ...current,
      [issueId]: data.comments || [],
    }));
  } catch (error) {
    setCommentErrors((current) => ({
      ...current,
      [issueId]: error.message,
    }));
  } finally {
    setCommentsLoading((current) => ({
      ...current,
      [issueId]: false,
    }));
  }
}

async function handleAddComment(issueId) {
  const content = (commentDrafts[issueId] || "").trim();

  if (!content) {
    setCommentErrors((current) => ({
      ...current,
      [issueId]: "Write a comment first.",
    }));
    return;
  }

  try {
    setCommentErrors((current) => ({
      ...current,
      [issueId]: "",
    }));

    const token = localStorage.getItem("token");

    const response = await fetch(
      `http://localhost:8383/api/issues/${issueId}/comments`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to add comment");
    }

    setCommentDrafts((current) => ({
      ...current,
      [issueId]: "",
    }));

    await loadComments(issueId);
  } catch (error) {
    setCommentErrors((current) => ({
      ...current,
      [issueId]: error.message,
    }));
  }
}



  if (loading) return <p>Loading project...</p>;
  if (error) return <p>{error}</p>;
  if (!project) return <p>Project not found.</p>;

  return (
    <div className="p-6">
      <Link to="/projects" className="text-blue-600">
        ← Back to Projects
      </Link>

      <h1 className="mt-4 text-3xl font-bold">
        {project.name}
      </h1>

      <p className="mt-2 text-gray-600">
        {project.description || "No description provided"}
      </p>

      <p className="mt-3">
        <strong>Status:</strong> {project.status}
      </p>

      <p className="mt-1">
        <strong>Team:</strong> {project.Team?.name || "No team"}
      </p>

    

    
<section className="mt-8">
  <h2 className="text-xl font-semibold">
    Project Issues ({issues.length})
  </h2>

    {assignmentError && (
  <p className="mt-3 text-sm text-rose-400">
    {assignmentError}
  </p>
)}

  {issuesLoading ? (
    <p className="mt-4 text-slate-400">Loading issues...</p>
  ) : issuesError ? (
    <p className="mt-4 text-rose-400">{issuesError}</p>
  ) : issues.length === 0 ? (
    <p className="mt-4 text-slate-400">
      No issues found for this project yet.
    </p>
  ) : (
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      {issues.map((issue) => (
        <div
          key={issue.id}
          className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
        >
          <h3 className="font-medium">{issue.title}</h3>

          <p className="mt-2 text-sm text-slate-400">
            {issue.description || "No description provided."}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-md bg-white/10 px-2 py-1 text-xs">
              {issue.status}
            </span>

            <span className="rounded-md bg-indigo-500/15 px-2 py-1 text-xs text-indigo-300">
              {issue.priority}
            </span>

            <span className="rounded-md bg-white/10 px-2 py-1 text-xs">
              {issue.type}
            </span>
        </div>
        
<div className="mt-4">
  <label className="mb-2 block text-sm text-slate-400">
    Assignee
  </label>

  <select
    value={issue.assigneeId ?? ""}
    onChange={(event) =>
      handleAssignIssue(issue.id, event.target.value)
    }
    className="w-full rounded-lg border border-white/10 bg-slate-900 p-2 text-sm text-white"
  >
    <option value="">Unassigned</option>

    {members.map((membership) => (
      <option
        key={membership.userId}
        value={membership.userId}
      >
        {membership.User?.name || membership.User?.email || `User ${membership.userId}`}
      </option>
    ))}
  </select>
</div>

    
<div className="mt-4">
  <label className="mb-2 block text-sm text-slate-400">
    Due date
  </label>

  
<input
  type="date"
  value={dateDrafts[issue.id] ?? issue.dueDate ?? ""}
  onChange={(event) =>
    setDateDrafts((current) => ({
      ...current,
      [issue.id]: event.target.value,
    }))
  }
  onBlur={(event) => {
    const selectedDate = event.target.value;

    if (selectedDate !== (issue.dueDate || "")) {
      handleUpdateDueDate(issue.id, selectedDate);
    }

    setDateDrafts((current) => {
      const updated = { ...current };
      delete updated[issue.id];
      return updated;
    });
  }}
  className="w-full rounded-lg border border-white/10 bg-slate-900 p-2 text-sm text-white"
/>


  {issue.dueDate && (
    <button
      type="button"
      onClick={() => handleUpdateDueDate(issue.id, "")}
      className="mt-2 text-sm text-rose-400 hover:text-rose-300"
    >
      Clear due date
    </button>
  )}
</div>

<div className="mt-5 border-t border-white/10 pt-4">
  <button
    type="button"
    onClick={() => loadComments(issue.id)}
    className="text-sm font-medium text-indigo-400 hover:text-indigo-300"
  >
    Load comments
  </button>

  {commentsLoading[issue.id] && (
    <p className="mt-3 text-sm text-slate-400">
      Loading comments...
    </p>
  )}

  {commentErrors[issue.id] && (
    <p className="mt-3 text-sm text-rose-400">
      {commentErrors[issue.id]}
    </p>
  )}

  {(commentsByIssue[issue.id] || []).map((comment) => (
    <div
      key={comment.id}
      className="mt-3 rounded-lg bg-white/[0.03] p-3"
    >
      <p className="text-sm font-medium">
        {comment.User?.name || "Project member"}
      </p>

      <p className="mt-1 whitespace-pre-wrap text-sm text-slate-300">
        {comment.content}
      </p>

      <p className="mt-2 text-xs text-slate-500">
        {comment.createdAt
          ? new Date(comment.createdAt).toLocaleString()
          : ""}
      </p>
    </div>
  ))}

  <textarea
    value={commentDrafts[issue.id] || ""}
    onChange={(event) =>
      setCommentDrafts((current) => ({
        ...current,
        [issue.id]: event.target.value,
      }))
    }
    placeholder="Write a comment..."
    rows={2}
    className="mt-3 w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-sm text-white"
  />

  <button
    type="button"
    onClick={() => handleAddComment(issue.id)}
    className="mt-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-500"
  >
    Add Comment
  </button>
</div>


        </div>
      ))}
    

    </div>
  )}
</section>


    </div>

  

  );


}




export default ProjectDetailsPage;
