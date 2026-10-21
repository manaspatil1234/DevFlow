import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [teamId, setTeamId] = useState("");
  const [formError, setFormError] = useState("");
  const [creating, setCreating] = useState(false);

  const [editingProject, setEditingProject] = useState(null);
  const [updating, setUpdating] = useState(false); 
  
  const [selectedProject, setSelectedProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState("");

  const [newMemberId, setNewMemberId] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("member");
  const [teamMembers, setTeamMembers] = useState([]);
const [teamMembersLoading, setTeamMembersLoading] = useState(false);
  const navigate = useNavigate();
  useEffect(()=>{
    async function loadProjects(){
        try{

            const token = localStorage.getItem("token")

           const headers={
                        Authorization:`Bearer ${token}`,
                    }

            const [projectsResponse,teamsResponse] = await Promise.all([
                fetch("http://localhost:8383/api/projects", { headers }),
                fetch("http://localhost:8383/api/teams", { headers }),
            ]
                
            )
            const projectsData = await projectsResponse.json();
            const teamsData = await teamsResponse.json();
            

             if (!projectsResponse.ok) {
          throw new Error(
            projectsData.message || "Failed to load projects"
          );
        }

        if (!teamsResponse.ok) {
          throw new Error(
            teamsData.message || "Failed to load teams"
          );
        }

         setProjects(projectsData.projects || []);
        setTeams(teamsData.teams || []);

        }catch(error){
            setError(error.message || "Something went wrong");
        }finally {
        setLoading(false);
        }
        
    }
    loadProjects()
  },[])

  async function handleCreateProject(event) {
    event.preventDefault();

    if (name.trim().length < 3) {
      setFormError("Project name must contain at least 3 characters.");
      return;
    }

    if (!teamId) {
      setFormError("Please select a team.");
      return;
    }

    setCreating(true);
    setFormError("");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:8383/api/projects",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim(),
            teamId: Number(teamId),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          Array.isArray(data.message)
            ? data.message.join(", ")
            : data.message || "Failed to create project"
        );
      }

      setProjects((previousProjects) => [
        data.project,
        ...previousProjects,
      ]);

      setName("");
      setDescription("");
      setTeamId("");
      setIsModalOpen(false);
    } catch (err) {
      setFormError(err.message || "Something went wrong");
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-slate-400">
        Loading projects...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-rose-400">
        {error}
      </div>
    );
  }

  async function handleUpdateProject(event) {
  event.preventDefault();

  if (!editingProject) return;

  if (name.trim().length < 3) {
    setFormError("Project name must contain at least 3 characters.");
    return;
  }

  setUpdating(true);
  setFormError("");

  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `http://localhost:8383/api/projects/${editingProject.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to update project"
      );
    }

    setProjects((previousProjects) =>
      previousProjects.map((project) =>
        project.id === data.project.id
          ? data.project
          : project
      )
    );

    setIsModalOpen(false);
    setEditingProject(null);
    setName("");
    setDescription("");
  } catch (err) {
    setFormError(err.message || "Something went wrong");
  } finally {
    setUpdating(false);
  }
}
async function handleDeleteProject(project) {
  const confirmed = window.confirm(
    `Are you sure you want to delete "${project.name}"?`
  );

  if (!confirmed) return;

  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `http://localhost:8383/api/projects/${project.id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to delete project");
    }

    setProjects((previousProjects) =>
      previousProjects.filter(
        (currentProject) => currentProject.id !== project.id
      )
    );
  } catch (err) {
    window.alert(err.message || "Something went wrong");
  }
}

async function handleViewMembers(project) {
  setSelectedProject(project);
setMembers([]);
setTeamMembers([]);
setMembersError("");
setMembersLoading(true);

loadTeamMembers(project);

  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `http://localhost:8383/api/projects/${project.id}/members`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch project members");
    }

    setMembers(data.members || []);
  } catch (err) {
    setMembersError(err.message || "Something went wrong");
  } finally {
    setMembersLoading(false);
  }
}


async function loadTeamMembers(project) {
  if (!project?.teamId) {
    setTeamMembers([]);
    return;
  }

  setTeamMembersLoading(true);
  setMembersError("");

  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `http://localhost:8383/api/teams/${project.teamId}/members`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load team members");
    }

    setTeamMembers(data.members || []);
  } catch (err) {
    setMembersError(err.message || "Failed to load team members");
  } finally {
    setTeamMembersLoading(false);
  }
}


async function handleAddMember(event){
  event.preventDefault();

  if(!selectedProject) return

 const parsedUserId = Number(newMemberId);

if (!newMemberId || !Number.isInteger(parsedUserId) || parsedUserId <= 0) {
  setMembersError("Please select a team member.");
  return;
}

const selectedTeamMember = teamMembers.find(
  (membership) => Number(membership.userId) === parsedUserId
);

if (!selectedTeamMember) {
  setMembersError("Select a valid member of this project's team.");
  return;
}
   setMembersError("");

   try{
    const token =localStorage.getItem("token")

    const response = await fetch(
      `http://localhost:8383/api/projects/${selectedProject.id}/members`,
      {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          Authorization:`Bearer ${token}`,
        },
        body:JSON.stringify({
          userId:parsedUserId,
          role:newMemberRole,
        })
      }
    )
    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to add project member"
      );
    }

    setNewMemberId('')
    setNewMemberRole("member")

   }catch(err){
      setMembersError(err.message || "Something went wrong");
   }

}


async function handleRemoveMember(membership) {
  if (!selectedProject) return;

  const user = membership.User;

  const confirmed = window.confirm(
    `Remove ${user?.name || `user ${membership.userId}`} from ${selectedProject.name}?`
  );

  if (!confirmed) return;

  setMembersError("");

  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `http://localhost:8383/api/projects/${selectedProject.id}/members`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: membership.userId,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to remove project member"
      );
    }

    await handleViewMembers(selectedProject);
  } catch (err) {
    setMembersError(err.message || "Something went wrong");
  }
}


async function handleUpdateMemberRole(membership, newRole) {
  if (!selectedProject) return;
  if (membership.role === newRole) return;

  const confirmed = window.confirm(
    `Change this member's role from ${membership.role} to ${newRole}?`
  );

  if (!confirmed) return;

  setMembersError("");

  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `http://localhost:8383/api/projects/${selectedProject.id}/members/${membership.userId}/role`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          role: newRole,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to update member role"
      );
    }

    await handleViewMembers(selectedProject);
  } catch (err) {
    setMembersError(err.message || "Something went wrong");
  }
}


  return (
     <div className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="mt-2 text-slate-400">
            Manage and explore your projects.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setFormError("");
            setIsModalOpen(true);
          }}
          className="rounded-lg bg-indigo-500 px-4 py-2 font-medium hover:bg-indigo-400"
        >
          + Create Project
        </button>
      </div>

      {projects.length === 0 ? (
        <p className="text-slate-400">
          No projects found. Create a project to get started.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-indigo-400/50"
            >
              <h2 className="text-lg font-semibold">
                {project.name}
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                {project.description || "No description provided."}
              </p>

              <p className="mt-4 text-xs text-slate-500">
                Project ID: {project.id}
              </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
                type="button"
                onClick={() => {
                    setEditingProject(project);
                    setName(project.name || "");
                    setDescription(project.description || "");
                    setFormError("");
                    setIsModalOpen(true);
                }}
                className="mt-4 rounded-lg border border-white/10 px-3 py-2 text-sm hover:bg-white/10"
                >
                Edit Project
                </button>

                <button
                    type="button"
                    onClick={() => handleDeleteProject(project)}
                    className="mt-4 ml-2 rounded-lg border border-rose-500/30 px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10"
                    >
                    Delete Project
                </button>

                <button
                  type="button"
                  onClick={() => handleViewMembers(project)}
                  className="mt-4 ml-2 rounded-lg border border-white/10 px-3 py-2 text-sm hover:bg-white/10"
                >
                  View Members
              </button>

                <button
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white"
                >
                  View Project
                </button>
                </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <form
            onSubmit={editingProject ? handleUpdateProject : handleCreateProject}
            className="w-full max-w-lg space-y-4 rounded-2xl border border-white/10 bg-slate-900 p-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {editingProject ? "Edit Project" : "Create Project"}
              </h2>

              <button
                type="button"
                onClick={() => {
                    setIsModalOpen(false);
                    setEditingProject(null);
                    setName("");
                    setDescription("");
                    setFormError("");
                    }}
                className="text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>

            <div>
              <label className="mb-1 block text-sm text-slate-300">
                Project name
              </label>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                minLength={3}
                required
                className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-white"
                placeholder="e.g. DevFlow Website"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-slate-300">
                Description
              </label>
              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                rows={3}
                className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-white"
                placeholder="What is this project about?"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-slate-300">
                Team
              </label>
              <select
                value={teamId}
                onChange={(event) => setTeamId(event.target.value)}
                required
                className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-white"
              >
                <option value="">Select a team</option>

                {teams.map((team) => (
                  <option key={team.id} value={String(team.id)}>
                    {team.name}
                  </option>
                ))}
              </select>

              {teams.length === 0 && (
                <p className="mt-2 text-sm text-amber-400">
                  No teams available. A team must exist before you
                  can create a project.
                </p>
              )}
            </div>

            {formError && (
              <p className="text-sm text-rose-400">
                {formError}
              </p>
            )}

            <button
            type="submit"
            disabled={creating || updating || (!editingProject && teams.length === 0)}
            className="w-full rounded-lg bg-indigo-500 px-4 py-2 font-medium hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
            {creating || updating
                ? "Saving..."
                : editingProject
                ? "Save Changes"
                : "Create Project"}
            </button>
          </form>
        </div>
      )}

      {selectedProject && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
    <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Project Members</h2>
          <p className="mt-1 text-sm text-slate-400">
            {selectedProject.name}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedProject(null);
            setMembers([]);
            setMembersError("");
            setTeamMembers([]);
          }}
          className="text-slate-400 hover:text-white"
        >
          Close
        </button>
      </div>

          <form
  onSubmit={handleAddMember}
  className="mb-5 space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-4"
>
  <h3 className="font-medium">Add a Project Member</h3>

  
<div>
  <label className="mb-1 block text-sm text-slate-300">
    Team Member
  </label>

  <select
    value={newMemberId}
    onChange={(event) => setNewMemberId(event.target.value)}
    required
    disabled={teamMembersLoading}
    className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-white disabled:opacity-50"
  >
    <option value="">
      {teamMembersLoading
        ? "Loading team members..."
        : "Select a team member"}
    </option>

    {teamMembers
      .filter(
        (membership) =>
          !members.some(
            (projectMember) =>
              Number(projectMember.userId) === Number(membership.userId)
          )
      )
      .map((membership) => (
        <option key={membership.userId} value={membership.userId}>
          {membership.User?.name || membership.User?.email || `User ${membership.userId}`}
          {membership.User?.email ? ` (${membership.User.email})` : ""}
        </option>
      ))}
  </select>

  {!teamMembersLoading && teamMembers.length === 0 && (
    <p className="mt-2 text-xs text-amber-400">
      No team members found. Add members to this team first.
    </p>
  )}
</div>


  <div>
    <label className="mb-1 block text-sm text-slate-300">
      Role
    </label>

    <select
      value={newMemberRole}
      onChange={(event) => setNewMemberRole(event.target.value)}
      className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-white"
    >
      <option value="member">Member</option>
      <option value="admin">Admin</option>
    </select>
  </div>

  <button
    type="submit"
    className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium hover:bg-indigo-400"
  >
    Add Member
  </button>
</form>

      {membersLoading ? (
        <p className="text-slate-400">Loading members...</p>
      ) : membersError ? (
        <p className="text-rose-400">{membersError}</p>
      ) : members.length === 0 ? (
        <p className="text-slate-400">No members found.</p>
      ) : (
        <div className="space-y-3">
          {members.map((membership) => (
            <div
              key={membership.id}
              className="flex items-center justify-between gap-3 rounded-lg bg-white/5 p-3"
            >
              <div>
                <p className="font-medium">
                  {membership.User?.name || "Unknown user"}
                </p>
                <p className="text-sm text-slate-400">
                  {membership.User?.email || "No email available"}
                </p>
              </div>

              <div className="flex items-center gap-2">
              
              <select
                value={membership.role}
                onChange={(event) =>
                  handleUpdateMemberRole(membership, event.target.value)
                }
                className="rounded-lg border border-white/10 bg-slate-800 px-2 py-1 text-xs text-white"
                aria-label={`Role for ${membership.User?.name || `user ${membership.userId}`}`}
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>


              <button
                type="button"
                onClick={() => handleRemoveMember(membership)}
                className="rounded-lg border border-rose-500/30 px-3 py-1 text-xs text-rose-400 hover:bg-rose-500/10"
              >
                Remove
              </button>
            </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
)}

    </div>
  );
}

export default ProjectsPage;
