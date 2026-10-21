
import { useState } from "react";
import { useNavigate,Link,useLocation } from "react-router-dom";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
const navigate = useNavigate();
const location = useLocation();

const registered = location.state?.registered
  async function handleLogin(e) {
    e.preventDefault();

    console.log("Sign In clicked!");

    setError("");
    setLoading(true)
    
    try{

        const response = await fetch(
            "http://localhost:8383/api/auth/login",
            {
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                },
                body:JSON.stringify({email,password}),
            }
        )
        const data = await response.json()
        if(!response.ok){
            throw new Error(data.message||"Login failed")
        }
        localStorage.setItem("token",data.token)
        localStorage.setItem("user",JSON.stringify(data.user))

        console.log("Login successful",data.user)
        navigate("/", { replace: true });

    }catch(err){
        setError(err.message||"Unable to connect to the server")
    }finally{
        setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b0b10] px-4 text-slate-200">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111118] p-8">
        <h1 className="text-2xl font-bold text-white">
          Welcome to DevFlow
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Sign in to continue to your workspace.
        </p>

        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          {registered && (
            <p className="text-sm text-emerald-400">
              Account created successfully! You can now sign in.
            </p>
          )}
            {error && (
                <p className="text-sm text-rose-400">{error}</p>
                )}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm text-slate-300"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-3 text-white outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm text-slate-300"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-3 text-white outline-none focus:border-violet-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-violet-600 px-4 py-3 font-medium text-white hover:bg-violet-500"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-400">
  Don't have an account?{" "}
  <Link
    to="/signup"
    className="font-medium text-violet-400 hover:text-violet-300"
  >
    Sign up
  </Link>
</p>
      </div>
    </div>
  );
}

export default LoginPage;
