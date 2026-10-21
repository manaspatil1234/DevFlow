
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Settings2, UserRound, ShieldCheck } from "lucide-react";

function SettingsPage() {
  const navigate = useNavigate();

  let currentUser = null;

  try {
    currentUser = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    currentUser = null;
  }

  return (
    <div className="min-h-screen bg-[#0b0b10] p-6 text-slate-200 md:p-10">
      <div className="mx-auto max-w-3xl">
        <button
          onClick={() => navigate("/")}
          className="mb-8 flex items-center gap-2 text-sm text-slate-400 hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </button>

        <div className="mb-8 flex items-center gap-3">
          <Settings2 size={28} className="text-violet-400" />
          <div>
            <h1 className="text-2xl font-semibold text-white">Settings</h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage your DevFlow account.
            </p>
          </div>
        </div>

        <section className="mb-5 rounded-xl border border-white/[0.08] bg-[#111118] p-6">
          <div className="mb-5 flex items-center gap-3">
            <UserRound size={20} className="text-violet-400" />
            <h2 className="font-medium text-white">Profile</h2>
          </div>

          <div className="space-y-4">
            <div>
              <p className="mb-1 text-xs text-slate-500">Name</p>
              <p className="text-sm text-slate-200">
                {currentUser?.name || "Not available"}
              </p>
            </div>

            <div>
              <p className="mb-1 text-xs text-slate-500">Email</p>
              <p className="text-sm text-slate-200">
                {currentUser?.email || "Not available"}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-white/[0.08] bg-[#111118] p-6">
          <div className="mb-3 flex items-center gap-3">
            <ShieldCheck size={20} className="text-violet-400" />
            <h2 className="font-medium text-white">Account security</h2>
          </div>

          <p className="text-sm leading-6 text-slate-400">
            Your account information is displayed here. Password changes
            should be connected to a secure backend endpoint before this
            feature is enabled.
          </p>
        </section>
      </div>
    </div>
  );
}

export default SettingsPage;
