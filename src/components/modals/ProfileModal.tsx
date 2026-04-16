import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { FiX, FiUploadCloud } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

interface ProfileForm {
  full_name: string;
  mobile_number: string;
  age: number;
}

function ProfileModal({ onClose }: { onClose: () => void }) {
  const { user, updateUser } = useAuth();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user?.avatar ? `${user.avatar}?t=${Date.now()}` : null,
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarError, setAvatarError] = useState("");
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileForm>({
    defaultValues: {
      full_name: user?.fullName ?? "",
      mobile_number: user?.mobileNumber ?? "",
      age: user?.age ?? undefined,
    },
  });

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleAvatarChange = (file: File) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setAvatarError("Only JPG, PNG, or WebP images are allowed");
      return;
    }
    setAvatarError("");
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data: ProfileForm) => {
    setLoading(true);
    setServerErrors({});
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append("full_name", data.full_name);
      formData.append("mobile_number", data.mobile_number);
      formData.append("age", String(data.age));
      if (avatarFile) formData.append("avatar", avatarFile);

      const res = await api.put("/profile", formData);
      updateUser(res.data.data);
      setSuccess(true);
      setTimeout(() => onClose(), 1000);
    } catch (err: any) {
      const apiErrors = err.response?.data?.errors ?? {};
      const mapped: Record<string, string> = {};
      for (const key in apiErrors) {
        mapped[key] = apiErrors[key][0];
      }
      setServerErrors(mapped);
    } finally {
      setLoading(false);
    }
  };

  const isProfileComplete = !!user?.profileComplete;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative z-10 w-full max-w-[480px] rounded-2xl bg-white px-10 py-8 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-gray-400 hover:text-gray-600"
        >
          <FiX className="text-xl" />
        </button>

        <h2 className="text-center text-2xl font-bold text-gray-900 mb-6">
          Profile
        </h2>

        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar"
                className="h-14 w-14 rounded-full object-cover"
              />
            ) : (
              <div className="h-14 w-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-400 text-xl font-bold">
                {user?.username?.[0]?.toUpperCase()}
              </div>
            )}
            {!isProfileComplete && (
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-yellow-400 border-2 border-white" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {user?.username}
            </p>
            {!isProfileComplete && (
              <p className="text-xs text-amber-500 font-medium">
                Incomplete Profile
              </p>
            )}
            {isProfileComplete && (
              <p className="text-xs text-green-500 font-medium">
                Profile Complete ✓
              </p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Username"
              {...register("full_name", {
                required: "Name is required",
                minLength: {
                  value: 3,
                  message: "Name must be at least 3 characters",
                },
                maxLength: {
                  value: 50,
                  message: "Name must not exceed 50 characters",
                },
              })}
              className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 ${
                errors.full_name || serverErrors.full_name
                  ? "border-red-400"
                  : "border-gray-200"
              }`}
            />
            {(errors.full_name || serverErrors.full_name) && (
              <p className="mt-1 text-xs text-red-500">
                {errors.full_name?.message ?? serverErrors.full_name}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={user?.email ?? ""}
              readOnly
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-400 outline-none cursor-not-allowed"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Mobile Number
              </label>
              <div className="flex">
                <span className="flex items-center rounded-l-lg border border-r-0 border-gray-200 bg-gray-50 px-3 text-sm text-gray-500">
                  +995
                </span>
                <input
                  type="text"
                  placeholder="5XX XXX XXX"
                  {...register("mobile_number", {
                    required: "Mobile number is required",
                    validate: (val) => {
                      const digits = val.replace(/\s/g, "");
                      if (!digits.startsWith("5"))
                        return "Georgian mobile numbers must start with 5";
                      if (digits.length !== 9)
                        return "Mobile number must be exactly 9 digits";
                      return true;
                    },
                  })}
                  className={`w-full rounded-r-lg border px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 ${
                    errors.mobile_number || serverErrors.mobile_number
                      ? "border-red-400"
                      : "border-gray-200"
                  }`}
                />
              </div>
              {(errors.mobile_number || serverErrors.mobile_number) && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.mobile_number?.message ?? serverErrors.mobile_number}
                </p>
              )}
            </div>

            <div className="w-24">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Age
              </label>
              <input
                type="number"
                placeholder="25"
                {...register("age", {
                  required: "Age is required",
                  min: { value: 16, message: "Must be at least 16" },
                  max: { value: 120, message: "Invalid age" },
                })}
                className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 ${
                  errors.age || serverErrors.age
                    ? "border-red-400"
                    : "border-gray-200"
                }`}
              />
              {(errors.age || serverErrors.age) && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.age?.message ?? serverErrors.age}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Upload Avatar
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) handleAvatarChange(file);
              }}
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 py-6 hover:border-indigo-400 transition-colors"
            >
              {avatarFile ? (
                <img
                  src={avatarPreview!}
                  alt="Preview"
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <>
                  <FiUploadCloud className="mb-2 text-2xl text-gray-400" />
                  <p className="text-sm text-gray-500">
                    Drag and drop or{" "}
                    <span className="font-medium text-indigo-600">
                      Upload file
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-gray-400">JPG, PNG or WebP</p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleAvatarChange(file);
              }}
            />
            {avatarError && (
              <p className="mt-1 text-xs text-red-500">{avatarError}</p>
            )}
          </div>

          {success && (
            <p className="text-center text-sm text-green-500 font-medium">
              Profile updated successfully ✓
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors"
          >
            {loading ? "Saving..." : "Update Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfileModal;
