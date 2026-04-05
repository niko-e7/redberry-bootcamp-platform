import { useState } from "react";
import { useForm } from "react-hook-form";
import { FiX, FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

interface LoginForm {
  email: string;
  password: string;
}

function LoginModal() {
  const { login, closeModal, openRegister } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setServerError("");
    try {
      await login(data.email, data.password);
    } catch (err: any) {
      setServerError(
        err.response?.data?.message ?? "Invalid credentials. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={closeModal}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-[440px] rounded-2xl bg-white px-10 py-8 shadow-xl">
        {/* Close */}
        <button
          onClick={closeModal}
          className="absolute right-5 top-5 text-gray-400 hover:text-gray-600"
        >
          <FiX className="text-xl" />
        </button>

        <h2 className="text-center text-2xl font-bold text-gray-900 mb-1">
          Welcome Back
        </h2>
        <p className="text-center text-sm text-gray-500 mb-8">
          Log in to continue learning
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
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
                errors.email ? "border-red-400" : "border-gray-200"
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
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
              <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Server error */}
          {serverError && (
            <p className="text-center text-sm text-red-500">{serverError}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-400">or</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <p className="text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={openRegister}
              className="font-semibold text-indigo-600 hover:underline"
            >
              Sign Up
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

export default LoginModal;