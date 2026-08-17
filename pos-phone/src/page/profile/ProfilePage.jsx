import { useState, useEffect } from "react";
import { getProfile, changePassword } from "../../api/profileApi";
import { useAlert } from "../../components/common/Alert";
import { getProfile as getStoredProfile, setProfile } from "../../store/profile.store";
import {
  FiUser,
  FiLock,
  FiShield,
  FiClock,
  FiSave,
  FiEye,
  FiEyeOff,
  FiCheckCircle,
  FiEdit3,
} from "react-icons/fi";

const ProfilePage = () => {
  const alert = useAlert();

  const [profile, setProfileState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await getProfile();
      if (res?.success && res.data) {
        setProfileState(res.data);
        setProfile(res.data);
      } else {
        const stored = getStoredProfile();
        if (stored) setProfileState(stored);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      const stored = getStoredProfile();
      if (stored) setProfileState(stored);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!passwordForm.current_password) {
      alert.warning("Current password is required", {
        description: "Please enter your current password.",
      });
      return;
    }

    if (!passwordForm.new_password) {
      alert.warning("New password is required", {
        description: "Please enter a new password.",
      });
      return;
    }

    if (passwordForm.new_password.length < 6) {
      alert.warning("Password too short", {
        description: "Password must be at least 6 characters.",
      });
      return;
    }

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      alert.warning("Passwords do not match", {
        description: "New password and confirm password must match.",
      });
      return;
    }

    setSavingPassword(true);
    try {
      const loadingId = alert.showAlert({
        type: "info",
        message: "Changing password...",
        description: "Please wait...",
        duration: 0,
        closable: false,
      });

      const res = await changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });

      alert.hideAlert(loadingId);

      if (res?.success) {
        setPasswordForm({ current_password: "", new_password: "", confirm_password: "" });
        alert.success("Password changed successfully!", {
          description: "Your password has been updated.",
        });
      } else {
        alert.error("Failed to change password", {
          description: res?.message || "Please try again.",
        });
      }
    } catch (error) {
      alert.error("An error occurred", {
        description: error.message || "Please try again later.",
      });
    } finally {
      setSavingPassword(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent"></div>
          <p className="text-sm text-gray-500 mt-3">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center">
              <FiUser className="w-5 h-5 text-white" />
            </div>
            My Profile
          </h1>
          <p className="text-sm text-gray-500 mt-1 ml-13">View your profile and manage your password</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:w-56 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden lg:sticky lg:top-6">
              {[
                { key: "profile", label: "Profile Info", icon: <FiUser className="w-4 h-4" /> },
                { key: "password", label: "Change Password", icon: <FiLock className="w-4 h-4" /> },
              ].map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`w-full flex items-center gap-3 px-5 py-3.5 text-sm transition-colors border-b border-gray-100 last:border-b-0 ${
                      isActive
                        ? "bg-gray-900 text-white font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span className={isActive ? "text-white" : "text-gray-400"}>
                      {tab.icon}
                    </span>
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {activeTab === "profile" && profile && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Profile Header */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-8">
                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-white text-2xl font-bold border-2 border-white/30">
                      {getInitials(profile.name)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
                      <p className="text-gray-300 text-sm mt-0.5">@{profile.username}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          profile.is_active
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                            : "bg-red-500/20 text-red-300 border border-red-400/30"
                        }`}>
                          <FiCheckCircle className="w-3 h-3" />
                          {profile.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile Details */}
                <div className="p-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                    <FiEdit3 className="w-4 h-4 text-gray-400" />
                    Account Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <div className="flex items-center gap-2 mb-1.5">
                        <FiUser className="w-4 h-4 text-gray-400" />
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</span>
                      </div>
                      <p className="text-sm font-medium text-gray-800">{profile.name || "N/A"}</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <div className="flex items-center gap-2 mb-1.5">
                        <FiUser className="w-4 h-4 text-gray-400" />
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Username</span>
                      </div>
                      <p className="text-sm font-medium text-gray-800">@{profile.username || "N/A"}</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <div className="flex items-center gap-2 mb-1.5">
                        <FiShield className="w-4 h-4 text-gray-400" />
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Role</span>
                      </div>
                      <p className="text-sm font-medium text-gray-800">{profile.role_name || "N/A"}</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <div className="flex items-center gap-2 mb-1.5">
                        <FiCheckCircle className="w-4 h-4 text-gray-400" />
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</span>
                      </div>
                      <p className={`text-sm font-medium ${profile.is_active ? "text-emerald-600" : "text-red-600"}`}>
                        {profile.is_active ? "Active" : "Inactive"}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <div className="flex items-center gap-2 mb-1.5">
                        <FiClock className="w-4 h-4 text-gray-400" />
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</span>
                      </div>
                      <p className="text-sm font-medium text-gray-800">{formatDate(profile.create_at)}</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <div className="flex items-center gap-2 mb-1.5">
                        <FiClock className="w-4 h-4 text-gray-400" />
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</span>
                      </div>
                      <p className="text-sm font-medium text-gray-800">{formatDate(profile.update_at)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "password" && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
                  <h2 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <FiLock className="w-4 h-4 text-gray-400" />
                    Change Password
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Update your password to keep your account secure
                  </p>
                </div>

                <form onSubmit={handlePasswordSubmit} className="p-6">
                  <div className="max-w-md space-y-5">
                    {/* Current Password */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider mb-1.5">
                        Current Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type={showCurrentPw ? "text" : "password"}
                          name="current_password"
                          value={passwordForm.current_password}
                          onChange={handlePasswordChange}
                          placeholder="Enter current password"
                          className="w-full pl-10 pr-11 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPw(!showCurrentPw)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showCurrentPw ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider mb-1.5">
                        New Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type={showNewPw ? "text" : "password"}
                          name="new_password"
                          value={passwordForm.new_password}
                          onChange={handlePasswordChange}
                          placeholder="Enter new password"
                          className="w-full pl-10 pr-11 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPw(!showNewPw)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showNewPw ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Must be at least 6 characters</p>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider mb-1.5">
                        Confirm New Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type={showConfirmPw ? "text" : "password"}
                          name="confirm_password"
                          value={passwordForm.confirm_password}
                          onChange={handlePasswordChange}
                          placeholder="Confirm new password"
                          className="w-full pl-10 pr-11 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPw(!showConfirmPw)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPw ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={savingPassword}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-all shadow-sm disabled:opacity-50"
                      >
                        {savingPassword ? (
                          <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        ) : (
                          <FiSave className="w-4 h-4" />
                        )}
                        Change Password
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
