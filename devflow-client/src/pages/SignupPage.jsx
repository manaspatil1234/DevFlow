
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function SignupPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:8383/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      // Registration succeeded; go to login.
      navigate("/login", {
        replace: true,
        state: { registered: true, email },
      });
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-4 text-white">
      <form
        onSubmit={handleSignup}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-8"
      >
        <h1 className="text-3xl font-semibold">Create your account</h1>
        <p className="mt-2 text-sm text-slate-400">
          Join DevFlow and manage your projects in one place.
        </p>

        <label className="mt-6 block text-sm text-slate-300">
          Full name
        </label>
        <input
          className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 p-3 outline-none focus:border-violet-500"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          required
        />

        <label className="mt-4 block text-sm text-slate-300">
          Email
        </label>
        <input
          className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 p-3 outline-none focus:border-violet-500"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />

        <label className="mt-4 block text-sm text-slate-300">
          Password
        </label>
        <input
          className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 p-3 outline-none focus:border-violet-500"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          minLength={8}
          required
        />

        {error && (
          <p className="mt-4 text-sm text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-violet-600 p-3 font-medium transition hover:bg-violet-500 disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-violet-400 hover:text-violet-300"
          >
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}

export default SignupPage;
