import { useState } from "react";
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
import { useSelector } from "react-redux";
import Modal from "../../components/Modal";
import TwoFactorSetup from "../../components/TwoFactorSetup";
import TwoFactorDisable from "../../components/TwoFactorDisable";

const InputField = ({
  label,
  defaultValue,
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
        defaultValue={defaultValue}
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
  const [gender, setGender] = useState("male");
  const [saved, setSaved] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorModalOpen, setTwoFactorModalOpen] = useState(false);
  const [twoFactorMode, setTwoFactorMode] = useState("setup"); // setup or disable

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
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
          <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-primary/20 flex items-center justify-center text-5xl mb-3 shadow-inner">
            👨
          </div>
          <button className="text-xs font-black text-blue-600 uppercase tracking-widest hover:underline">
            Update Profile Image
          </button>
        </div>

        {/* Profile Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
          <InputField
            label="First Name"
            defaultValue={user?.name?.split(" ")[0] || "Gaurav"}
            icon={User}
          />
          <InputField
            label="Last Name"
            defaultValue={user?.name?.split(" ")[1] || "Moghe"}
            icon={User}
          />
          <InputField
            label="Email"
            defaultValue={user?.email || "gaurav@example.com"}
            type="email"
            icon={Mail}
          />
          <InputField
            label="Phone"
            defaultValue="9876543210"
            type="tel"
            icon={Phone}
          />
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
              label="New Password"
              type="password"
              placeholder="New password"
              icon={Lock}
            />
            <InputField
              label="Confirm Password"
              type="password"
              placeholder="Confirm password"
              icon={Shield}
            />
          </div>
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
            className={`font-black text-sm px-6 py-3 rounded-xl transition-all active:scale-95 ${saved
                ? "bg-green-500 text-white"
                : "bg-blue-700 hover:bg-blue-800 text-white"
              }`}
          >
            {saved ? "✓ Saved!" : "Save Changes"}
          </button>
          <button className="bg-primary hover:opacity-90 text-white font-black text-sm px-6 py-3 rounded-xl transition-all active:scale-95">
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
            token="demo-token"
            onSetupComplete={() => {
              setTwoFactorEnabled(true);
              setTwoFactorModalOpen(false);
            }}
            onCancel={() => setTwoFactorModalOpen(false)}
          />
        ) : (
          <TwoFactorDisable
            token="demo-token"
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
