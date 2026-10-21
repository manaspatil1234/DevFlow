import { useNavigate,useLocation } from "react-router-dom";
import { useState ,useEffect} from "react";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  Bell,
  CheckCircle2,
  CircleDot,
  Command,
  FolderKanban,
  LayoutDashboard,
  Plus,
  Search,
  Settings2,
  Users,
  Zap,
  LogOut,Minus,AlertTriangle
} from "lucide-react";


const issues = [
  
];
function DashboardPage() {
    const navigate =useNavigate()
    const location = useLocation();
    const [isModalOpen,setIsModalOpen]=useState(false)
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("Medium");
    const [status, setStatus] = useState("Todo");
    const [issues, setIssues] = useState([]);
    const [issuesLoading, setIssuesLoading] = useState(true);
    const [issuesError, setIssuesError] = useState("");
    const [error, setError] = useState("");
    const [availableProjects, setAvailableProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState("");
    const [projectError, setProjectError] = useState("");
    const [editingIssue, setEditingIssue] = useState(null);
const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editPriority, setEditPriority] = useState("medium");
    const [editStatus, setEditStatus] = useState("open");
    const [editError, setEditError] = useState("");
    const [editLoading, setEditLoading] = useState(false);
    const [totalIssues, setTotalIssues] = useState(0);
    const [currentUser, setCurrentUser] = useState(() => {
    try {
    return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
    return null;
      }
    });  
const [searchQuery, setSearchQuery] = useState("");
const [isSearchOpen, setIsSearchOpen] = useState(false);
const [statusFilter, setStatusFilter] = useState("all");
const [priorityFilter, setPriorityFilter] = useState("all");
const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
const [notifications, setNotifications] = useState([]);
const [notificationsLoading, setNotificationsLoading] = useState(false);
const [notificationsError, setNotificationsError] = useState("");

const projectColors = [
  "bg-violet-500",
  "bg-cyan-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-pink-500",
];


const dashboardProjects = availableProjects.map((project, index) => {
  const projectIssues = issues.filter(
    (issue) => Number(issue.projectId) === Number(project.id)
  );

  const completedIssues = projectIssues.filter(
    (issue) => issue.status === "resolved"
  ).length;

  const progress = projectIssues.length
    ? Math.round((completedIssues / projectIssues.length) * 100)
    : 0;

  return {
    ...project,
    key: project.name.slice(0, 3).toUpperCase(),
    color: projectColors[index % projectColors.length],
    open: projectIssues.filter(
      (issue) => issue.status !== "resolved"
    ).length,
    progress,
  };
});

// Keep the filtering logic OUTSIDE the map above
const normalizedSearch = searchQuery.trim().toLowerCase();


const filteredIssues = issues.filter((issue) => {
  const projectName =
    availableProjects.find(
      (project) => Number(project.id) === Number(issue.projectId)
    )?.name || "";

  const matchesSearch =
    issue.title?.toLowerCase().includes(normalizedSearch) ||
    projectName.toLowerCase().includes(normalizedSearch);

  const matchesStatus =
    statusFilter === "all" || issue.status === statusFilter;

  const matchesPriority =
    priorityFilter === "all" ||
    issue.priority?.toLowerCase() === priorityFilter;

  return matchesSearch && matchesStatus && matchesPriority;
});


const filteredDashboardProjects = dashboardProjects.filter((project) =>
  project.name.toLowerCase().includes(normalizedSearch)
);




function handleLogout(){
    localStorage.removeItem("token")
    localStorage.removeItem("user")

    navigate("/login",{replace:true})
}


useEffect(() => {
  if (!isNotificationsOpen) return;

  async function loadNotifications() {
    try {
      setNotificationsLoading(true);
      setNotificationsError("");

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
        throw new Error(data.message || "Failed to load activity");
      }

      setNotifications(data.activities || []);
    } catch (err) {
      setNotificationsError(
        err.message || "Unable to load activity"
      );
    } finally {
      setNotificationsLoading(false);
    }
  }

  loadNotifications();
}, [isNotificationsOpen]);


useEffect(()=>{
    async function loadIssues(){
        try{

            setIssuesLoading(true)
            setIssuesError('')

            const token=localStorage.getItem("token")

            const response = await fetch(
                "http://localhost:8383/api/issues?page=1&limit=100",
                {
                    headers:{
                        Authorization:`Bearer ${token}`
                    }
                }
            )

            const data = await response.json()
            if (!response.ok) {
        throw new Error(data.message || "Failed to load issues");
      }
      setIssues(data.issues)
      setTotalIssues(data.total ?? data.issues.length);

        }catch(err){
            setIssuesError(err.message || "Unable to load issues");
        }finally {
      setIssuesLoading(false);
    }
    }
    loadIssues()
},[])

async function handleCreateIssue() {
  if (!title.trim()) {
    setError("Issue title is required.");
    return;
  }

  if (!selectedProjectId) {
    setError("Please select a project.");
    return;
  }

  setError("");

  try {
    const token = localStorage.getItem("token");

    const response = await fetch("http://localhost:8383/api/issues", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim(),
        projectId: Number(selectedProjectId),
        priority:priority.toLowerCase(),
        status:
    status === "Todo"
      ? "open"
      : status === "In Progress"
        ? "in_progress"
        : status === "Done"
          ? "resolved"
          : "open",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to create issue");
    }

    console.log("Issue created:", data.issue);


    setIssues((prevIssues)=>[
        {
            id: data.issue.id,
    title: data.issue.title,
    description: data.issue.description,
    project: availableProjects.find(
  (project) => project.id === data.issue.projectId
)?.name || "Unknown project",
    priority: data.issue.priority,
    status: data.issue.status,
    color:
      data.issue.priority === "critical" || data.issue.priority === "high"
        ? "text-rose-400"
        : data.issue.priority === "medium"
          ? "text-amber-400"
          : "text-slate-400",
    icon:
      data.issue.priority === "low"
        ? ArrowDown
        : ArrowUp,
        },
        ...prevIssues,
    ])

    setIsModalOpen(false);
    setTitle("");
    setDescription("");
    setPriority("Medium");
    setStatus("Todo");
  } catch (err) {
    setError(err.message || "Something went wrong.");
  }
}

function handleEditClick(issue){
    setEditingIssue(issue);
  setEditTitle(issue.title || "");
  setEditDescription(issue.description || "");
  setEditPriority(issue.priority?.toLowerCase() || "medium");
  setEditStatus(issue.status?.toLowerCase() || "open");
  setEditError("");
  setIsEditModalOpen(true);
}

    async function handleDeleteIssue(issue){
        const confirmed = window.confirm(
            `Are you sure you want to delete "${issue.title}"`
        )

        if(!confirmed) return;

        try{

            const token = localStorage.getItem("token")

            const response = await fetch(
                `http://localhost:8383/api/issues/${issue.id}`,
                {
                    method:"DELETE",
                    headers:{
                        Authorization:`Bearer ${token}`,
                    }
                }
            )

            const data = await response.json();

            if (!response.ok) {
      throw new Error(data.message || "Failed to delete issue.");
    }

    setIssues((previousIssues)=>previousIssues.filter(
        (currentIssue)=>currentIssue.id!==issue.id
    ))
        }catch(error){
            window.alert(error.message || "Something went wrong.");
        }
    }

async function handleSaveEdit(){
    if(!editingIssue) return;

    if(!editTitle.trim() || editTitle.trim().length < 3){
        setEditError("Title must be at least 3 characters.");
        return;
    }

    setEditLoading(true);
    setEditError("")


try{

    const token = localStorage.getItem("token");

    const response = await fetch(
        `http://localhost:8383/api/issues/${editingIssue.id}`,
        {
            method:"PATCH",
            headers:{
                "Content-Type":"application/json",
                Authorization:`Bearer ${token}`,
            },
            body:JSON.stringify({
                title:editTitle.trim(),
                description:editDescription.trim(),
                priority:editPriority,
                status:editStatus,
            })
        }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "Failed to update issue.");
    }

      setIssues((previousIssues) =>
      previousIssues.map((issue) =>
        issue.id === data.issue.id
          ? {
              ...issue,
              ...data.issue,
              color:
                data.issue.priority === "critical"
                  ? "text-rose-400"
                  : data.issue.priority === "high"
                    ? "text-orange-400"
                    : data.issue.priority === "medium"
                      ? "text-amber-400"
                      : "text-slate-400",
            }
          : issue
      )
    );
    setIsEditModalOpen(false);
    setEditingIssue(null);

}catch(err){
     setEditError(error.message || "Something went wrong.");
}finally {
    setEditLoading(false);
  }
}

useEffect(()=>{
    async function loadProjects(){
        try{
            const token = localStorage.getItem("token");

            const response = await fetch(
                "http://localhost:8383/api/projects",
                {
                    headers:{
                        Authorization:`Bearer ${token}`,
                    },
                }
            )
            const data = await response.json()
            if (!response.ok) {
        throw new Error(data.message || "Failed to load projects");
      }
      setAvailableProjects(data.projects)

      if(data.projects.length >0){
        setSelectedProjectId(String(data.projects[0].id))
      }

        }catch(err){
            setProjectError(err.message)
        }
    }
    loadProjects()
},[])

    return(
        
    <>
    <div className="min-h-screen bg-[#0b0b10] text-slate-200">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-white/[0.07] bg-[#0e0e14] p-4 md:flex md:flex-col">
          <div className="mb-8 flex items-center gap-3 px-2 pt-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 shadow-lg shadow-violet-950/40">
              <Command size={20} />
            </div>
            <div>
              <h1 className="font-semibold tracking-tight text-white">
                DevFlow
              </h1>
              <p className="text-xs text-slate-500">Workspace</p>
            </div>
          </div>

          <button onClick={() => setIsSearchOpen(true)} className="mb-6 flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-400">
            <Search size={16} />
            Search anything
            <span className="ml-auto rounded border border-white/10 px-1.5 py-0.5 text-xs">
              /
            </span>
          </button>
          {isSearchOpen && (
            <div className="mb-6">
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search issues or projects..."
                className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-violet-500"
              />

              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setIsSearchOpen(false);
                }}
                className="mt-2 text-xs text-slate-500 hover:text-white"
              >
                Close search
              </button>
            </div>
          )}

          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
            Workspace
          </p>

          <nav className="space-y-1">
            <SidebarItem icon={LayoutDashboard} label="Overview" active={location.pathname==="/"} onClick={()=>navigate("/")}/>
            <SidebarItem icon={CircleDot} label="My issues" active={location.pathname==="/issues"} onClick={()=>navigate("/issues")} />
            <SidebarItem icon={FolderKanban} label="Projects" active={location.pathname==="/projects"} onClick={()=>navigate("/projects")}/>
            
<SidebarItem
  icon={Users}
  label="Teams"
  active={location.pathname === "/teams"}
  onClick={() => navigate("/teams")}
/>

<SidebarItem
  icon={Activity}
  label="Activity"
  active={location.pathname === "/activity"}
  onClick={() => navigate("/activity")}
/>

          </nav>

          <div className="mb-3 mt-9 flex items-center justify-between px-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
              Your projects
            </p>
           <button
  type="button"
  aria-label="Add project"
  onClick={() => navigate("/projects")}
  className="text-slate-500 hover:text-white"
>
  <Plus size={15} />
</button>
          </div>

          
<div className="space-y-1">
  {filteredDashboardProjects.map((project) => (
    <button
      type="button"
      key={project.id}
      onClick={() => navigate(`/projects/${project.id}`)}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-slate-400 hover:bg-white/[0.04] hover:text-white"
    >
      <span className={`h-2.5 w-2.5 shrink-0 rounded-md ${project.color}`} />
      <span className="truncate">{project.name}</span>
    </button>
  ))}
</div>


          <div className="mt-auto border-t border-white/[0.07] pt-4">
            <button  onClick={() => navigate("/settings")} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-white/[0.04]">
              <Settings2 size={17} />
              Settings
            </button>
            <div className="mt-3 flex items-center gap-3 rounded-xl bg-white/[0.035] p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 text-sm font-semibold text-white">
                {currentUser?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {currentUser?.name || "Your account"}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {currentUser?.email || "Developer"}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-3 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10"
            >
            <LogOut size={17} />
            Logout
            </button>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="flex h-[68px] items-center justify-between border-b border-white/[0.07] px-5 md:px-8">
            <div>
              <p className="text-xs text-slate-500">Workspace / Overview</p>
              <h2 className="mt-1 text-sm font-semibold text-white">
                Dashboard
              </h2>
            </div>
            <div className="flex items-center gap-3">
              
<div className="relative">
  <button
    type="button"
    aria-label="Notifications"
    aria-expanded={isNotificationsOpen}
    onClick={() => setIsNotificationsOpen((open) => !open)}
    className="rounded-lg border border-white/10 p-2 text-slate-400 hover:bg-white/[0.05]"
  >
    <Bell size={17} />
  </button>

  {isNotificationsOpen && (
    <div className="absolute right-0 top-12 z-50 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-white/10 bg-[#111118] shadow-xl sm:w-96">
      <div className="flex items-center justify-between border-b border-white/[0.08] p-4">
        <div>
          <h3 className="font-semibold text-white">Notifications</h3>
          <p className="mt-1 text-xs text-slate-500">
            Recent workspace activity
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNotificationsOpen(false)}
          className="text-sm text-slate-400 hover:text-white"
        >
          Close
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notificationsLoading && (
          <p className="p-4 text-sm text-slate-400">
            Loading activity...
          </p>
        )}

        {notificationsError && (
          <p className="p-4 text-sm text-rose-400">
            {notificationsError}
          </p>
        )}

        {!notificationsLoading &&
          !notificationsError &&
          notifications.length === 0 && (
            <p className="p-4 text-sm text-slate-400">
              No activity yet.
            </p>
          )}

        {!notificationsLoading &&
          !notificationsError &&
          notifications.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => {
                setIsNotificationsOpen(false);

                if (item.Issue?.projectId) {
                  navigate(`/projects/${item.Issue.projectId}`);
                } else {
                  navigate("/activity");
                }
              }}
              className="flex w-full gap-3 border-b border-white/[0.05] p-4 text-left hover:bg-white/[0.04]"
            >
              <Activity
                size={17}
                className="mt-0.5 shrink-0 text-violet-400"
              />

              <div className="min-w-0">
                <p className="text-sm text-slate-200">
                  {item.description || item.action || "Workspace activity"}
                </p>

                {item.Issue?.title && (
                  <p className="mt-1 truncate text-xs text-violet-300">
                    {item.Issue.title}
                  </p>
                )}

                <p className="mt-1 text-xs text-slate-500">
                  {item.User?.name || "A team member"}
                  {item.createdAt
                    ? ` · ${new Date(item.createdAt).toLocaleString()}`
                    : ""}
                </p>
              </div>
            </button>
          ))}
      </div>

      <button
        type="button"
        onClick={() => {
          setIsNotificationsOpen(false);
          navigate("/activity");
        }}
        className="w-full p-3 text-sm text-violet-400 hover:bg-white/[0.04]"
      >
        View all activity
      </button>
    </div>
  )}
</div>

              <button className="flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-violet-500" onClick={()=>setIsModalOpen(true)}>
                <Plus size={16} />
                <span>New issue</span>
              </button>
            </div>
          </header>

          <div className="mx-auto max-w-[1400px] p-5 md:p-8">
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="mb-2 text-sm text-violet-400">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
                  Good to see you again{currentUser?.name ? `, ${currentUser.name}` : ""}.
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Here's what's happening across your workspace.
                </p>
              </div>
              <button onClick={() => navigate("/activity")}  className="flex w-fit items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 hover:bg-white/[0.04]">
                <Activity size={15} />
                View activity
              </button>
            </div>

            <section className="mb-9 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Total issues"
                value={totalIssues}
                detail="Across all projects"
                icon={CircleDot}
                color="text-violet-400"
              />
              <StatCard
                label="In progress"
                value={issues.filter((issue) => issue.status === "in_progress").length}
                detail="Currently being worked on"
                icon={Activity}
                color="text-sky-400"
              />
              <StatCard
                label="Completed"
                value={issues.filter((issue) => issue.status === "resolved").length}
                detail="Resolved issues"
                icon={CheckCircle2}
                color="text-emerald-400"
              />
              <StatCard
                label="Active projects"
                value={availableProjects.length}
                detail="Across your workspace"
                icon={FolderKanban}
                color="text-amber-400"
              />
            </section>

            <section className="mb-9">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white">Your projects</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    A snapshot of your team's work
                  </p>
                </div>
                <button onClick={() => navigate("/issues")} className="text-sm text-violet-400 hover:text-violet-300">
                  View all
                </button>
              </div>

              <div  className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {filteredDashboardProjects.map((project) => (
                  <article
                    key={project.key}
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="rounded-xl border border-white/[0.08] bg-[#111118] p-5 transition hover:border-violet-500/30 cursor-pointer"
                  >
                    <div className="mb-5 flex items-center justify-between">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${project.color} bg-opacity-15 text-sm font-bold`}
                      >
                        <span className="text-white">{project.key[0]}</span>
                      </div>
                      <span className="rounded-md border border-white/[0.08] px-2 py-1 text-xs text-slate-500">
                        {project.key}
                      </span>
                    </div>
                    <h4 className="font-medium text-white">{project.name}</h4>
                    <p className="mt-1 text-xs text-slate-500">
                      {project.open} open issues
                    </p>
                    <div className="mt-5">
                      <div className="mb-2 flex justify-between text-xs">
                        <span className="text-slate-500">Progress</span>
                        <span className="text-slate-300">
                          {project.progress}%
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                        <div
                          className={`h-full rounded-full ${project.color}`}
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#111118]">
              <div className="flex flex-col justify-between gap-3 border-b border-white/[0.07] p-5 sm:flex-row sm:items-center">
                <div>
                  <h3 className="font-semibold text-white">Recent issues</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    The latest updates from your projects
                  </p>
                </div>
                
<div className="flex flex-wrap items-center gap-2">
  <select
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
    className="rounded-lg border border-white/10 bg-[#111118] px-3 py-2 text-xs text-slate-300 outline-none focus:border-violet-500"
    aria-label="Filter by status"
  >
    <option value="all">All statuses</option>
    <option value="open">Open</option>
    <option value="in_progress">In progress</option>
    <option value="in_review">In review</option>
    <option value="resolved">Resolved</option>
  </select>

  <select
    value={priorityFilter}
    onChange={(e) => setPriorityFilter(e.target.value)}
    className="rounded-lg border border-white/10 bg-[#111118] px-3 py-2 text-xs text-slate-300 outline-none focus:border-violet-500"
    aria-label="Filter by priority"
  >
    <option value="all">All priorities</option>
    <option value="low">Low</option>
    <option value="medium">Medium</option>
    <option value="high">High</option>
    <option value="critical">Critical</option>
  </select>

  {(statusFilter !== "all" || priorityFilter !== "all") && (
    <button
      type="button"
      onClick={() => {
        setStatusFilter("all");
        setPriorityFilter("all");
      }}
      className="rounded-lg px-2 py-2 text-xs text-violet-400 hover:text-violet-300"
    >
      Clear filters
    </button>
  )}
</div>

              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left text-sm">
                  <thead className="bg-white/[0.02] text-[11px] uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-5 py-3 font-medium">Issue</th>
                      <th className="px-5 py-3 font-medium">Project</th>
                      <th className="px-5 py-3 font-medium">Priority</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                                            {issuesLoading && (
                            <tr>
                                <td colSpan={5} className="px-5 py-4 text-slate-400">
                                Loading issues...
                                </td>
                            </tr>
                            )}

                            {issuesError && (
                            <tr>
                                <td colSpan={5} className="px-5 py-4 text-rose-400">
                                {issuesError}
                                </td>
                            </tr>
                            )}

                            {!issuesLoading && !issuesError && filteredIssues.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-5 py-4 text-slate-400">
                                  {searchQuery.trim() ? "No matching issues found." : "No issues found."}
                                </td>
                            </tr>
                            )}
                    {!issuesLoading && !issuesError && filteredIssues.map((issue) => {
                      const priorityConfig = {
  low: {
    icon: ArrowDown,
    color: "text-slate-400",
  },
  medium: {
    icon: Minus,
    color: "text-amber-400",
  },
  high: {
    icon: ArrowUp,
    color: "text-orange-400",
  },
  critical: {
    icon: AlertTriangle,
    color: "text-rose-400",
  },
};

const currentPriority =
  issue.priority?.toLowerCase() || "medium";

const config =
  priorityConfig[currentPriority] || priorityConfig.medium;

const PriorityIcon = config.icon;
                      return (
                        <tr
                          key={issue.id}
                          onClick={() => handleEditClick(issue)}
                          className="border-t border-white/[0.05] transition hover:bg-white/[0.025]"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <CircleDot
                                size={16}
                                className="shrink-0 text-slate-500"
                              />
                              <div>
                                <p className="font-medium text-slate-200">
                                  {issue.title}
                                </p>
                                <p className="mt-1 text-xs text-slate-600">
                                  {issue.id}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-slate-400">
                            {availableProjects.find(
                              (project) => Number(project.id) === Number(issue.projectId)
                            )?.name || "Unknown project"}
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 ${config.color}`}
                            >
                              <PriorityIcon size={14} />
                              {issue.priority}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <StatusBadge status={issue.status} />
                          </td>
                          <td className="px-5 py-4">
                            <button
                                type="button"
                                onClick={(event) => {
                                event.stopPropagation();
                                handleDeleteIssue(issue);
                                }}
                                className="rounded-lg px-3 py-1.5 text-sm text-rose-400 hover:bg-rose-400/10"
                            >
                                Delete
                            </button>
                            </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <p className="mt-6 text-center text-xs text-slate-600">
              DevFlow · Built for teams that ship.
            </p>
          </div>
        </main>
      </div>
      
    </div>
   
{isModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
    <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#111118] p-6">
      
<div className="mt-5">
  <label
    htmlFor="issueTitle"
    className="mb-2 block text-sm text-slate-300"
  >
    Issue title
  </label>

  <input
    id="issueTitle"
    type="text"
    placeholder="e.g. Fix login validation"
    value={title}
    onChange={(e)=>{setTitle(e.target.value); setError("")}}
    className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-violet-500"
  />

{error && (
  <p className="mt-2 text-sm text-rose-400">
    {error}
  </p>
)}
    
<div className="mt-5">
  <label
    htmlFor="issueDescription"
    className="mb-2 block text-sm text-slate-300"
  >
    Description
  </label>

  <textarea
    id="issueDescription"
    placeholder="Describe what needs to be done..."
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    rows={4}
    className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-violet-500"
  />
</div>

<div className="mt-5">
  <label
    htmlFor="issueProject"
    className="mb-2 block text-sm text-slate-300"
  >
    Project
  </label>

  <select
    id="issueProject"
    value={selectedProjectId}
    onChange={(e) => setSelectedProjectId(e.target.value)}
    className="w-full rounded-lg border border-white/10 bg-[#111118] px-3 py-2 text-sm text-white outline-none focus:border-violet-500"
  >
    <option value="">Select a project</option>

    {availableProjects.map((project) => (
      <option key={project.id} value={String(project.id)}>
        {project.name}
      </option>
    ))}
  </select>

  {projectError && (
    <p className="mt-2 text-sm text-rose-400">{projectError}</p>
  )}
</div>

<div className="mt-5">
  <label
    htmlFor="issuePriority"
    className="mb-2 block text-sm text-slate-300"
  >
    Priority
  </label>

  <select
    id="issuePriority"
    value={priority}
    onChange={(e) => setPriority(e.target.value)}
    className="w-full rounded-lg border border-white/10 bg-[#111118] px-3 py-2 text-sm text-white outline-none focus:border-violet-500"
  >
    <option value="Low">Low</option>
    <option value="Medium">Medium</option>
    <option value="High">High</option>
  </select>
</div>
<div className="mt-5">
  <label
    htmlFor="issueStatus"
    className="mb-2 block text-sm text-slate-300"
  >
    Status
  </label>

  <select
    id="issueStatus"
    value={status}
    onChange={(e) => setStatus(e.target.value)}
    className="w-full rounded-lg border border-white/10 bg-[#111118] px-3 py-2 text-sm text-white outline-none focus:border-violet-500"
  >
    <option value="Todo">Todo</option>
    <option value="In Progress">In Progress</option>
    <option value="Done">Done</option>
  </select>
</div>
</div>
<div className="mt-6 flex justify-end gap-3">
  <button
    onClick={() => setIsModalOpen(false)}
    className="rounded-lg border border-white/10 px-4 py-2 text-slate-300 hover:bg-white/5"
  >
    Cancel
  </button>

  <button
    onClick={handleCreateIssue}
    className="rounded-lg bg-violet-600 px-4 py-2 text-white hover:bg-violet-500"
  >
    Create Issue
  </button>
</div>
    </div>
  </div>
)}

    {isEditModalOpen && editingIssue && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
    <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">
          Edit Issue
        </h2>

        <button
          type="button"
          onClick={() => setIsEditModalOpen(false)}
          className="text-slate-400 hover:text-white"
        >
          Cancel
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-slate-300">
            Title
          </label>
          <input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-white"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">
            Description
          </label>
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-white"
            rows={3}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">
            Priority
          </label>
          <select
            value={editPriority}
            onChange={(e) => setEditPriority(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-white"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">
            Status
          </label>
          <select
            value={editStatus}
            onChange={(e) => setEditStatus(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-white"
          >
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="in_review">In Review</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {editError && (
          <p className="text-sm text-rose-400">{editError}</p>
        )}

        <button
          type="button"
          onClick={handleSaveEdit}
          disabled={editLoading}
          className="w-full rounded-lg bg-indigo-500 px-4 py-2 font-medium text-white hover:bg-indigo-400 disabled:opacity-50"
        >
          {editLoading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  </div>
)}
    </>
    
        
  ) 
}

function SidebarItem({ icon: Icon, label, active = false,onClick }) {
  return (
    <button
    onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
        active
          ? "bg-violet-500/10 font-medium text-violet-300"
          : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
      }`}
    >
      <Icon size={17} />
      {label}
    </button>
  );
}

function StatCard({ label, value, detail, icon: Icon, color }) {
  return (
    <article className="rounded-xl border border-white/[0.08] bg-[#111118] p-5">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-slate-400">{label}</p>
        <Icon size={18} className={color} />
      </div>
      <p className="text-3xl font-semibold tracking-tight text-white">{value}</p>
      <p className="mt-2 text-xs text-slate-500">{detail}</p>
    </article>
  );
}

function StatusBadge({ status }) {
  const styles = {
    "In progress": "border-sky-500/20 bg-sky-500/10 text-sky-300",
    "In review": "border-violet-500/20 bg-violet-500/10 text-violet-300",
    Open: "border-slate-500/20 bg-slate-500/10 text-slate-300",
  };
const statusLabels = {
  open: "Open",
  in_progress: "In progress",
  in_review: "In review",
  resolved: "Resolved",
};

const label = statusLabels[status] || status;
  return (
    <span
      className={`inline-flex rounded-md border px-2 py-1 text-xs ${
        
        styles[status] || styles.Open
      }`}
    >
      {label}
    </span>
  );
    }
    
 

export default DashboardPage;
