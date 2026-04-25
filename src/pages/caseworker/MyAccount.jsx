import { useState, useEffect } from "react";
import {
  UserCircle,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Hash,
  Globe,
  Lock,
  Shield,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import Modal from "../../components/Modal";
import TwoFactorSetup from "../../components/TwoFactorSetup";
import TwoFactorDisable from "../../components/TwoFactorDisable";
import api from "../../services/api";
import { setCredentials } from "../../store/slices/authSlice";

const InputField = ({
  label,
  value,
  onChange,
  type = "text",
  icon: Icon,
  placeholder,
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
      {label}
    </label>
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-secondary placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all bg-gray-50/40"
      />
      {Icon && (
        <Icon
          size={15}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300"
        />
      )}
    </div>
  </div>
);

const MyAccount = () => {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const [gender, setGender] = useState("male");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorModalOpen, setTwoFactorModalOpen] = useState(false);
  const [twoFactorMode, setTwoFactorMode] = useState("setup"); // setup or disable
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [passwordError, setPasswordError] = useState("");

  const [formData, setFormData] = useState({
    first_name: user?.name?.split(" ")[0] || "",
    last_name: user?.name?.split(" ")[1] || "",
    email: user?.email || "",
    country_code: "+1",
    mobile: "",
    profile_pic: null,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/api/user/profile");
        const { first_name, last_name, email, country_code, mobile, two_factor_enabled } = response.data.data.user;
        setFormData((prev) => ({
          ...prev,
          first_name,
          last_name,
          email,
          country_code: country_code || "+1",
          mobile,
        }));
        setTwoFactorEnabled(two_factor_enabled || false);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, []);

  const handleInputChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, profile_pic: file }));
  };

  const handlePasswordChange = (field) => (e) => {
    setPasswordForm((prev) => ({ ...prev, [field]: e.target.value }));
    setPasswordError("");
  };

  const handlePasswordUpdate = async () => {
    if (!passwordForm.current_password || !passwordForm.new_password) {
      setPasswordError("Current password and new password are required");
      return;
    }
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError("Passwords do not match");
      return;
    }
    if (passwordForm.new_password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }

    try {
      setLoading(true);
      await api.post("/api/user/change-password", {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      setPasswordForm({ current_password: "", new_password: "", confirm_password: "" });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (error) {
      setPasswordError(error.response?.data?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");
      dispatch({ type: "auth/logout" });
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
      dispatch({ type: "auth/logout" });
      window.location.href = "/login";
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const data = new FormData();
      data.append("first_name", formData.first_name);
      data.append("last_name", formData.last_name);
      data.append("country_code", formData.country_code);
      data.append("mobile", formData.mobile);
      if (formData.profile_pic) {
        data.append("profile_pic", formData.profile_pic);
      }

      const response = await api.put("/api/user/profile", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Profile update response:", response.status, response.data);

      dispatch(
        setCredentials({
          user: response.data.data.user,
          token: user.token,
        })
      );

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-4xl font-black text-secondary tracking-tight flex items-center gap-3">
          <UserCircle className="text-primary" size={36} />
          My Account
        </h1>
        <p className="text-primary font-bold text-sm mt-1">
          Manage your profile and account settings
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white p-8 rounded-xl shadow-sm border-2 border-primary/20 max-w-7xl">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-primary/20 flex items-center justify-center text-5xl mb-3 shadow-inner overflow-hidden">
            {formData.profile_pic ? (
              <img
                src={URL.createObjectURL(formData.profile_pic)}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              "👨"
            )}
          </div>
          <label className="text-xs font-black text-blue-600 uppercase tracking-widest hover:underline cursor-pointer">
            Update Profile Image
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Profile Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
          <InputField
            label="First Name"
            value={formData.first_name}
            onChange={handleInputChange("first_name")}
            icon={User}
          />
          <InputField
            label="Last Name"
            value={formData.last_name}
            onChange={handleInputChange("last_name")}
            icon={User}
          />
          <InputField
            label="Email"
            value={formData.email}
            onChange={handleInputChange("email")}
            type="email"
            icon={Mail}
          />
          <div className="flex gap-2">
            <div className="w-24">
              <InputField
                label="Country Code"
                value={formData.country_code}
                onChange={handleInputChange("country_code")}
                icon={Phone}
              />
            </div>
            <div className="flex-1">
              <InputField
                label="Mobile"
                value={formData.mobile}
                onChange={handleInputChange("mobile")}
                type="tel"
                icon={Phone}
              />
            </div>
          </div>
          {/* <InputField
            label="Date of Birth"
            defaultValue="01-01-2000"
            icon={Calendar}
          />
          <InputField label="Location" defaultValue="Nashik" icon={MapPin} />
          <InputField label="Postal Code" defaultValue="422001" icon={Hash} />
          <InputField
            label="Address"
            defaultValue="Nashik, Maharashtra"
            icon={Globe}
          /> */}
        </div>

        {/* Gender */}
        <div className="flex items-center gap-6 mb-8">
          {["male", "female"].map((g) => (
            <label
              key={g}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div
                onClick={() => setGender(g)}
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${gender === g
                    ? "border-orange-500 bg-orange-500"
                    : "border-gray-300"
                  }`}
              >
                {gender === g && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>
              <span className="text-sm font-bold text-gray-600 capitalize">
                {g}
              </span>
            </label>
          ))}
        </div>

        <div className="border-t border-gray-100 pt-6 mb-6">
          <h2 className="text-base font-black text-secondary mb-5 tracking-tight">
            Update Password
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputField
              label="Current Password"
              type="password"
              placeholder="Current password"
              value={passwordForm.current_password}
              onChange={handlePasswordChange("current_password")}
              icon={Lock}
            />
            <InputField
              label="New Password"
              type="password"
              placeholder="New password"
              value={passwordForm.new_password}
              onChange={handlePasswordChange("new_password")}
              icon={Lock}
            />
            <InputField
              label="Confirm Password"
              type="password"
              placeholder="Confirm password"
              value={passwordForm.confirm_password}
              onChange={handlePasswordChange("confirm_password")}
              icon={Shield}
            />
          </div>
          {passwordError && (
            <p className="text-xs font-bold text-red-600 mt-2">{passwordError}</p>
          )}
          <button
            onClick={handlePasswordUpdate}
            disabled={loading}
            className="mt-4 font-black text-sm px-6 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </div>

        <div className="border-t border-gray-100 pt-6 mb-6">
          <h2 className="text-base font-black text-secondary mb-5 tracking-tight">
            Two-Factor Authentication
          </h2>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="text-sm font-bold text-secondary">
                {twoFactorEnabled ? "2FA is enabled" : "2FA is disabled"}
              </p>
              <p className="text-xs font-bold text-gray-500 mt-0.5">
                {twoFactorEnabled ? "Your account is protected with 2FA" : "Enable 2FA for enhanced security"}
              </p>
            </div>
            {twoFactorEnabled ? (
              <button
                onClick={() => {
                  setTwoFactorMode("disable");
                  setTwoFactorModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition"
              >
                Disable 2FA
              </button>
            ) : (
              <button
                onClick={() => {
                  setTwoFactorMode("setup");
                  setTwoFactorModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl text-sm font-black text-white bg-primary hover:bg-primary-dark transition"
              >
                Enable 2FA
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleSave}
            disabled={loading}
            className={`font-black text-sm px-6 py-3 rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${saved
                ? "bg-green-500 text-white"
                : "bg-blue-700 hover:bg-blue-800 text-white"
              }`}
          >
            {loading ? "Saving..." : saved ? "✓ Saved!" : "Save Changes"}
          </button>
          <button
            onClick={handleLogout}
            className="bg-primary hover:opacity-90 text-white font-black text-sm px-6 py-3 rounded-xl transition-all active:scale-95"
          >
            Logout
          </button>
        </div>
      </div>

      <Modal
        open={twoFactorModalOpen}
        onClose={() => setTwoFactorModalOpen(false)}
        title=""
        maxWidthClass="max-w-md"
        bodyClassName="p-0"
        footer={null}
      >
        {twoFactorMode === "setup" ? (
          <TwoFactorSetup
            token={user?.token}
            onSetupComplete={() => {
              setTwoFactorEnabled(true);
              setTwoFactorModalOpen(false);
            }}
            onCancel={() => setTwoFactorModalOpen(false)}
          />
        ) : (
          <TwoFactorDisable
            token={user?.token}
            onDisableComplete={() => {
              setTwoFactorEnabled(false);
              setTwoFactorModalOpen(false);
            }}
            onCancel={() => setTwoFactorModalOpen(false)}
          />
        )}
      </Modal>
    </div>
  );
};

export default MyAccount;
