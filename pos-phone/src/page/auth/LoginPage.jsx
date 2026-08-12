import React, { useState } from "react";
import { request } from "../../util/helper";
import { setAccessToken, setProfile } from "../../store/profile.store";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiLogIn,
  FiUser,
  FiGrid,
} from "react-icons/fi";
import { useAlert } from "../../components/common/Alert";
import img from "../../assets/image.png";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const alert = useAlert();
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
      alert.warning("Please fill in all fields", {
        description: "Username and password are required.",
      });
      return;
    }
    setLoading(true);
    setError("");
    try {
      const param = {
        username: state.username,
        password: state.password,
      };
      const res = await request("auth/login", "post", param);
      if (res.success === true && res.access_token) {
        setAccessToken(res.access_token);
        setProfile(res.data);
        alert.success("Login successful!", {
          description: `Welcome back, ${res.data?.username || 'User'}!`,
          duration: 3000,
        });
        navigate(location.state?.from?.pathname || "/dashboard", { replace: true });
        return;
      }
      setError(res.message || "Login failed");
      alert.error("Login failed", {
        description: res.message || "Invalid credentials. Please try again.",
      });
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      setError("Unable to login. Please try again.");
      alert.error("Unable to login", {
        description: "Please check your connection and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full h-150 max-w-7xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-5 border border-gray-100">
        {/* LEFT SIDE - Image */}
        <div className="hidden lg:block lg:col-span-3 relative h-full min-h-[550px]">
          <img
            src={img}
            alt="Manufacturing"
            className="w-full h-full object-cover"
          />
          {/* Overlay with text */}
          <div className="absolute inset-0 bg-black/60 flex flex-col justify-between p-10">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/10">
                <FiGrid className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-sm font-bold text-white block">
                  Point Of Sale
                </span>
                <span className="text-[10px] text-gray-300 tracking-wider">
                  EXECUTION SYSTEM
                </span>
              </div>
            </div>

            {/* Bottom Text */}
            <div className="text-white">
              <h2 className="text-2xl font-bold mb-2">Welcome back</h2>
              <p className="text-gray-300 text-sm">
                Streamline your production, optimize resources,
                <br />
                and drive efficiency with real-time insights.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - Login Form */}
        <div className="lg:col-span-2 p-8 md:p-10 flex flex-col justify-center bg-white">
          <div className="max-w-[350px] mx-auto w-full">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
              <div className="w-10 h-10 bg-black rounded-2xl flex items-center justify-center">
                <FiGrid className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-sm font-bold text-gray-800 block">
                  Point Of Sale
                </span>
                <span className="text-[10px] text-gray-400 tracking-wider">
                  EXECUTION SYSTEM
                </span>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                Welcome back
              </h2>
              <p className="text-gray-500 text-xs mt-1">
                Sign in to your account to continue
              </p>
            </div>

            {/* Error Message - Keep for inline error display */}
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-3">
                <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-500 text-xs font-bold">!</span>
                </div>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    <FiMail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="username"
                    value={state.username}
                    onChange={handleChange}
                    placeholder="name@company.com"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-gray-50 hover:bg-white focus:bg-white text-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
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
                    className="w-full pl-10 pr-12 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all bg-gray-50 hover:bg-white focus:bg-white text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <FiEyeOff className="w-4 h-4" />
                    ) : (
                      <FiEye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center">
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                  />
                  Remember me
                </label>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black hover:bg-gray-800 text-white py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed text-sm"
              >
                {loading ? (
                  <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    <FiLogIn className="w-4 h-4" />
                    Sign in
                  </>
                )}
              </button>
            </form>

            {/* Register Link */}
            <p className="text-center text-sm text-gray-500 mt-5">
              Don't have an account?{" "}
              <button className="text-black font-medium hover:underline transition-colors">
                Create account
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;