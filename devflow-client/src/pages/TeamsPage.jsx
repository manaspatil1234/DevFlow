
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedTeam, setSelectedTeam] = useState(null);
const [members, setMembers] = useState([]);
const [membersLoading, setMembersLoading] = useState(false);
const [memberError, setMemberError] = useState("");
const [memberSuccess, setMemberSuccess] = useState("");
const [memberEmail, setMemberEmail] = useState("");
const [addingMember, setAddingMember] = useState(false);

  const navigate = useNavigate();

  async function loadTeams() {
    try {
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:8383/api/teams", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load teams.");
      }

      setTeams(data.teams || []);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTeams();
  }, []);

  async function handleCreateTeam(e) {
    e.preventDefault();
    setFormError("");
    setSuccess("");

    if (!name.trim()) {
      setFormError("Team name is required.");
      return;
    }

    if (name.trim().length < 3) {
      setFormError("Team name must contain at least 3 characters.");
      return;
    }

    try {
      setCreating(true);

      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:8383/api/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create team.");
      }

      setShowCreateModal(false);
      setName("");
      setDescription("");
      setSuccess("Team created successfully!");

      await loadTeams();
    } catch (err) {
      setFormError(err.message || "Something went wrong.");
    } finally {
      setCreating(false);
    }
  }

  
async function openMembers(team) {
  setSelectedTeam(team);
  setMembers([]);
  setMemberError("");
  setMemberSuccess("");
  setMemberEmail("");
  setMembersLoading(true);

  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `http://localhost:8383/api/teams/${team.id}/members`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load team members.");
    }

    setMembers(data.members || []);
  } catch (err) {
    setMemberError(err.message || "Something went wrong.");
  } finally {
    setMembersLoading(false);
  }
}

async function handleAddMember(e) {
  e.preventDefault();
  setMemberError("");
  setMemberSuccess("");

  if (!memberEmail.trim()) {
    setMemberError("Enter the email of a registered user.");
    return;
  }

  try {
    setAddingMember(true);

    const token = localStorage.getItem("token");

    const response = await fetch(
      `http://localhost:8383/api/teams/${selectedTeam.id}/members`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: memberEmail.trim() }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to add team member.");
    }

    setMemberEmail("");
    setMemberSuccess("Member added successfully!");

    await openMembers(selectedTeam);
  } catch (err) {
    setMemberError(err.message || "Something went wrong.");
  } finally {
    setAddingMember(false);
  }
}


  if (loading) {
    return <div className="p-6 text-slate-300">Loading teams...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0b0b10] p-6 text-rose-400">
        <p>{error}</p>
        <button
          type="button"
          onClick={loadTeams}
          className="mt-4 rounded-lg bg-violet-600 px-4 py-2 text-white hover:bg-violet-500"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b10] p-6 text-slate-200">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Teams</h1>
          <p className="mt-2 text-slate-400">
            Explore the teams in your DevFlow workspace.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setFormError("");
            setSuccess("");
            setShowCreateModal(true);
          }}
          className="rounded-lg bg-violet-600 px-4 py-2.5 font-medium text-white transition hover:bg-violet-500"
        >
          + Create Team
        </button>
      </div>

      {success && (
        <div className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300">
          {success}
        </div>
      )}

      <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.04] p-4">
        <p className="text-sm text-slate-400">Total teams</p>
        <p className="mt-1 text-2xl font-bold text-white">{teams.length}</p>
      </div>

      {teams.length === 0 ? (
        <div className="mt-6 rounded-xl border border-white/10 p-8 text-center">
          <h2 className="font-semibold text-white">No teams found</h2>
          <p className="mt-2 text-sm text-slate-400">
            Create your first team to start organizing projects.
          </p>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="mt-4 rounded-lg bg-violet-600 px-4 py-2 text-white hover:bg-violet-500"
          >
            Create your first team
          </button>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {teams.map((team) => (
            <div
              key={team.id}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/15 text-lg font-bold text-violet-300">
                {team.name?.charAt(0)?.toUpperCase() || "T"}
              </div>

              <h2 className="mt-4 text-lg font-semibold text-white">
                {team.name}
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                {team.description || "No description provided."}
              </p>

              <p className="mt-4 text-xs text-slate-500">
                Team ID: {team.id}
              </p>

              <button
                type="button"
                onClick={() => openMembers(team)}
                className="mt-4 w-full rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/[0.06]"
              >
                Manage Members
              </button>

              <div className="mt-4 border-t border-white/10 pt-4">
                <h3 className="text-sm font-medium text-white">
                  Projects ({team.Projects?.length || 0})
                </h3>

                {team.Projects?.length ? (
                  <div className="mt-3 space-y-2">
                    {team.Projects.map((project) => (
                      <button
                        key={project.id}
                        type="button"
                        onClick={() => navigate(`/projects/${project.id}`)}
                        className="block w-full rounded-lg bg-white/[0.04] p-3 text-left hover:bg-white/[0.08]"
                      >
                        <p className="text-sm font-medium text-slate-200">
                          {project.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {project.status || "Project"}
                        </p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">
                    No projects assigned to this team yet.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !creating) {
              setShowCreateModal(false);
              setFormError("");
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-team-title"
            className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#15151f] p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="create-team-title"
                  className="text-xl font-bold text-white"
                >
                  Create a new team
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  Create a workspace for your projects and collaborators.
                </p>
              </div>

              <button
                type="button"
                disabled={creating}
                onClick={() => {
                  setShowCreateModal(false);
                  setFormError("");
                }}
                aria-label="Close modal"
                className="text-xl text-slate-400 hover:text-white disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateTeam} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="team-name"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Team name
                </label>
                <input
                  id="team-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Frontend Team"
                  maxLength={100}
                  autoFocus
                  required
                  className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-white outline-none placeholder:text-slate-500 focus:border-violet-500"
                />
              </div>

              <div>
                <label
                  htmlFor="team-description"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Description <span className="text-slate-500">(optional)</span>
                </label>
                <textarea
                  id="team-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What will this team work on?"
                  rows={3}
                  className="w-full resize-y rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-white outline-none placeholder:text-slate-500 focus:border-violet-500"
                />
              </div>

              {formError && (
                <p role="alert" className="text-sm text-rose-400">
                  {formError}
                </p>
              )}

              <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
                <button
                  type="button"
                  disabled={creating}
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormError("");
                  }}
                  className="rounded-lg border border-white/10 px-4 py-2 text-slate-300 hover:bg-white/[0.05] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-lg bg-violet-600 px-4 py-2 font-medium text-white hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creating ? "Creating..." : "Create Team"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      
{selectedTeam && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="members-title"
      className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#15151f] p-6 shadow-2xl"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 id="members-title" className="text-xl font-bold text-white">
            Team Members
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            {selectedTeam.name}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setSelectedTeam(null)}
          aria-label="Close members modal"
          className="text-xl text-slate-400 hover:text-white"
        >
          ×
        </button>
      </div>

      {memberError && (
        <p role="alert" className="mt-4 text-sm text-rose-400">
          {memberError}
        </p>
      )}

      {memberSuccess && (
        <p className="mt-4 text-sm text-emerald-400">
          {memberSuccess}
        </p>
      )}

      <div className="mt-5">
        <h3 className="text-sm font-semibold text-white">Current members</h3>

        {membersLoading ? (
          <p className="mt-3 text-sm text-slate-400">Loading members...</p>
        ) : members.length === 0 ? (
          !memberError && (
            <p className="mt-3 text-sm text-slate-400">
              No members found.
            </p>
          )
        ) : (
          <div className="mt-3 max-h-52 space-y-2 overflow-y-auto">
            {members.map((membership) => (
              <div
                key={membership.id}
                className="flex items-center justify-between gap-3 rounded-lg bg-white/[0.04] p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {membership.User?.name || membership.user?.name || "User"}
                  </p>
                  <p className="truncate text-xs text-slate-400">
                    {membership.User?.email || membership.user?.email || ""}
                  </p>
                </div>

                <span className="shrink-0 rounded-md bg-violet-500/15 px-2 py-1 text-xs capitalize text-violet-300">
                  {membership.role}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleAddMember} className="mt-6 border-t border-white/10 pt-5">
        <label
          htmlFor="member-email"
          className="mb-2 block text-sm font-medium text-slate-200"
        >
          Add an existing user by email
        </label>

        <input
          id="member-email"
          type="email"
          required
          value={memberEmail}
          onChange={(e) => setMemberEmail(e.target.value)}
          placeholder="member@example.com"
          className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-white outline-none placeholder:text-slate-500 focus:border-violet-500"
        />

        <div className="mt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setSelectedTeam(null)}
            className="rounded-lg border border-white/10 px-4 py-2 text-slate-300 hover:bg-white/[0.05]"
          >
            Close
          </button>

          <button
            type="submit"
            disabled={addingMember || membersLoading}
            className="rounded-lg bg-violet-600 px-4 py-2 font-medium text-white hover:bg-violet-500 disabled:opacity-60"
          >
            {addingMember ? "Adding..." : "Add Member"}
          </button>
        </div>
      </form>
    </div>
  </div>
)}


    </div>
  );
}

export default TeamsPage;
