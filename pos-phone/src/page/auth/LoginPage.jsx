import React, { useState } from "react";
import { request } from "../../util/helper";
import { setAccessToken, setProfile } from "../../store/profile.store";
import { useNavigate } from "react-router-dom";
import { 
  FiMail, 
  FiLock, 
  FiEye, 
  FiEyeOff, 
  FiLogIn, 
  FiUser,
  FiCheckCircle,
  FiShield,
  FiGrid,
  FiArrowRight,
  FiTrendingUp,
  FiPieChart,
  FiUsers,
  FiShoppingBag
} from "react-icons/fi";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [state, setState] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setState({
      ...state,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!state.username.trim() || !state.password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    var param = {
      username: state.username,
      password: state.password,
    };

    const res = await request("auth/login", "post", param);

    if (!res.error) {
      setAccessToken(res.access_token);
      setProfile(res.data);
      navigate("/");
    } else {
      setError(res.error?.username || res.error?.password || res.message || "Login failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-5">
        {/* LEFT SIDE - Brand/Info - 2/5 */}
        <div className="hidden lg:flex lg:col-span-2 flex-col bg-gradient-to-br from-gray-900 to-gray-800 text-white p-10 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-white/5 rounded-full"></div>
          
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>

          <div className="relative z-10 flex-1 flex flex-col">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-12">
              <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/10">
                <FiGrid className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">Dashboard</span>
            </div>

            {/* Welcome Message */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold leading-tight">
                Welcome back!
              </h1>
              <p className="text-gray-400 text-sm mt-2 leading-relaxed">
                Sign in to continue managing your business dashboard.
              </p>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-white/5 rounded-xl p-3 backdrop-blur-sm border border-white/5">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mb-2">
                  <FiTrendingUp className="w-4 h-4 text-gray-300" />
                </div>
                <p className="text-xs font-medium">Analytics</p>
                <p className="text-xs text-gray-400">Track performance</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 backdrop-blur-sm border border-white/5">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mb-2">
                  <FiPieChart className="w-4 h-4 text-gray-300" />
                </div>
                <p className="text-xs font-medium">Reports</p>
                <p className="text-xs text-gray-400">View insights</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 backdrop-blur-sm border border-white/5">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mb-2">
                  <FiUsers className="w-4 h-4 text-gray-300" />
                </div>
                <p className="text-xs font-medium">Users</p>
                <p className="text-xs text-gray-400">Manage access</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 backdrop-blur-sm border border-white/5">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mb-2">
                  <FiShoppingBag className="w-4 h-4 text-gray-300" />
                </div>
                <p className="text-xs font-medium">Products</p>
                <p className="text-xs text-gray-400">Inventory control</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="relative z-10 text-xs text-gray-500 mt-8">
            © 2024 Dashboard. All rights reserved.
          </div>
        </div>

        {/* RIGHT SIDE - Login Form - 3/5 */}
        <div className="lg:col-span-3 p-8 md:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-md mx-auto w-full">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
                <FiGrid className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-800">Dashboard</span>
            </div>
            
            <div className="mb-8 text-center lg:text-left">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                Sign In
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Enter your credentials to access your account
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-5 bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-start gap-3">
                <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-500 text-xs font-bold">!</span>
                </div>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    <FiUser className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="username"
                    value={state.username}
                    onChange={handleChange}
                    placeholder="Enter your username"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 outline-none transition-all bg-gray-50 hover:bg-white focus:bg-white text-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    <FiLock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={state.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 outline-none transition-all bg-gray-50 hover:bg-white focus:bg-white text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center">
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900" 
                  />
                  Remember me
                </label>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    <FiLogIn className="w-4 h-4" />
                    Sign In
                  </>
                )}
              </button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-400 text-center mb-2">Demo Credentials</p>
              <div className="flex items-center justify-center gap-6 text-xs">
                <div>
                  <span className="text-gray-500">Username:</span>
                  <span className="ml-1 font-mono text-gray-700">admin</span>
                </div>
                <div>
                  <span className="text-gray-500">Password:</span>
                  <span className="ml-1 font-mono text-gray-700">admin123</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;