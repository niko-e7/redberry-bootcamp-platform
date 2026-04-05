import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { FiX, FiEye, FiEyeOff, FiUploadCloud, FiChevronLeft } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

interface RegisterForm {
  email: string;
  password: string;
  password_confirmation: string;
  username: string;
  avatar?: FileList;
}

const STEPS = 3;

function RegisterModal() {
  const { register: registerUser, closeModal, openLogin } = useAuth();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarError, setAvatarError] = useState("");
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    getValues,
    trigger,
    formState: { errors },
  } = useForm<RegisterForm>();

  const nextStep = async () => {
    let valid = false;
    if (step === 1) valid = await trigger("email");
    if (step === 2) valid = await trigger(["password", "password_confirmation"]);
    if (step === 3) valid = await trigger("username");
    if (valid) setStep((s) => s + 1);
  };

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

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    setServerErrors({});
    try {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("password_confirmation", data.password_confirmation);
      formData.append("username", data.username);
      if (avatarFile) formData.append("avatar", avatarFile);
      await registerUser(formData);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={closeModal} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-[440px] rounded-2xl bg-white px-10 py-8 shadow-xl">
        {/* Close */}
        <button
          onClick={closeModal}
          className="absolute right-5 top-5 text-gray-400 hover:text-gray-600"
        >
          <FiX className="text-xl" />
        </button>

        {/* Back */}
        {step > 1 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="absolute left-5 top-5 text-gray-400 hover:text-gray-600"
          >
            <FiChevronLeft className="text-xl" />
          </button>
        )}

        <h2 className="text-center text-2xl font-bold text-gray-900 mb-1">
          Create Account
        </h2>
        <p className="text-center text-sm text-gray-500 mb-5">
          Join and start learning today
        </p>

        {/* Progress bar */}
        <div className="flex gap-2 mb-8">
          {Array.from({ length: STEPS }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                i < step ? "bg-indigo-600" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Step 1 — Email */}
          {step === 1 && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Email*
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  {...register("email", {
                    required: "Email is required",
                    minLength: { value: 3, message: "Min 3 characters" },
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Enter a valid email",
                    },
                  })}
                  className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 ${
                    errors.email || serverErrors.email
                      ? "border-red-400"
                      : "border-gray-200"
                  }`}
                />
                {(errors.email || serverErrors.email) && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.email?.message ?? serverErrors.email}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={nextStep}
                className="w-full rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
              >
                Next
              </button>
            </>
          )}

          {/* Step 2 — Password */}
          {step === 2 && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Password*
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    {...register("password", {
                      required: "Password is required",
                      minLength: { value: 3, message: "Min 3 characters" },
                    })}
                    className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 ${
                      errors.password ? "border-red-400" : "border-gray-200"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Confirm Password*
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirm password"
                    {...register("password_confirmation", {
                      required: "Please confirm your password",
                      validate: (val) =>
                        val === getValues("password") ||
                        "Passwords do not match",
                    })}
                    className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 ${
                      errors.password_confirmation
                        ? "border-red-400"
                        : "border-gray-200"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showConfirm ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {errors.password_confirmation && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.password_confirmation.message}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={nextStep}
                className="w-full rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
              >
                Next
              </button>
            </>
          )}

          {/* Step 3 — Username + Avatar */}
          {step === 3 && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Username*
                </label>
                <input
                  type="text"
                  placeholder="Username"
                  {...register("username", {
                    required: "Username is required",
                    minLength: { value: 3, message: "Min 3 characters" },
                  })}
                  className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 ${
                    errors.username || serverErrors.username
                      ? "border-red-400"
                      : "border-gray-200"
                  }`}
                />
                {(errors.username || serverErrors.username) && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.username?.message ?? serverErrors.username}
                  </p>
                )}
              </div>

              {/* Avatar upload */}
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
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
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
                      <p className="mt-1 text-xs text-gray-400">
                        JPG, PNG or WebP
                      </p>
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

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors"
              >
                {loading ? "Creating account..." : "Sign Up"}
              </button>
            </>
          )}

          {/* Divider + switch to login */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-400">or</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <button
              type="button"
              onClick={openLogin}
              className="font-semibold text-indigo-600 hover:underline"
            >
              Log In
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

export default RegisterModal;