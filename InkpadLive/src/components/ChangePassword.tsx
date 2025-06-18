
import { useState } from "react";
import type { FC, FormEvent } from "react";
import axios from "axios";
import { Link } from "react-router-dom";


const ChangePassword: FC = () => {

  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
const backend_base_url = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const oldPassword = formData.get("oldPassword") as string;
    const newPassword = formData.get("newPassword") as string;

    try {
      const res = await axios.post(
        `${backend_base_url}/api/auth/change-password`,
        { email, oldPass:oldPassword, newPass:newPassword }
      );
      
      if (res.data ) {
        setSuccess("Password changed successfully! You can now sign in.");
      } else {
        setError("Failed to change password. Please check your details.");
      }
    } catch (err) {
      setError("Failed to change password. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-teal-50 via-yellow-50 to-white">
      <div className="flex flex-col rounded-3xl shadow-2xl bg-white items-center px-10 py-8 w-full max-w-md relative overflow-hidden">

        <div className="absolute -top-10 -left-10 w-32 h-32 bg-yellow-100 rounded-full mix-blend-multiply opacity-60 pointer-events-none"></div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-teal-100 rounded-full mix-blend-multiply opacity-60 pointer-events-none"></div>

        <div className="h-16 flex items-center justify-center mb-2 z-10">
          <span className="text-3xl font-bold text-blue-400 tracking-wide">
            Inkpad Live
          </span>
        </div>
        <h4 className="mb-6 text-2xl font-semibold text-teal-600 z-10">
          Change Password
        </h4>
        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col items-center gap-3 z-10"
        >
          <input
            className="rounded-xl px-4 py-2 w-full text-lg border border-teal-100 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition outline-none"
            type="email"
            placeholder="Email"
            name="email"
            required
            autoComplete="username"
          />
          <input
            className="rounded-xl px-4 py-2 w-full text-lg border border-teal-100 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition outline-none"
            type="password"
            placeholder="Old Password"
            name="oldPassword"
            required
            autoComplete="current-password"
          />
          <input
            className="rounded-xl px-4 py-2 w-full text-lg border border-teal-100 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition outline-none"
            type="password"
            placeholder="New Password"
            name="newPassword"
            required
            autoComplete="new-password"
          />
          <button
            className="rounded-xl w-full py-2 text-lg font-semibold text-white bg-gradient-to-r from-teal-400 to-yellow-400 hover:from-teal-500 hover:to-yellow-500 transition mt-2 shadow"
            type="submit"
            disabled={loading}
          >
            {loading ? "Processing..." : "Proceed"}
          </button>
        </form>
        {success && (
          <div className="text-green-600 mt-2 text-sm z-10 text-center">
            {success}
          </div>
        )}
        {error && (
          <div className="text-red-500 mt-2 text-sm z-10 text-center">
            {error}
          </div>
        )}
        <Link to="/sign-in" className="w-full z-10">
          <p className="mt-4 text-center text-sm">
            Want to sign in?{" "}
            <span className="text-teal-500 hover:underline cursor-pointer">
              Sign In
            </span>
          </p>
        </Link>
      </div>
      {/* Custom color utilities for yellow and teal if not in your Tailwind config */}
      <style>{`
        .bg-yellow-100 { background-color: #fff9db; }
        .bg-teal-100 { background-color: #d0f5f9; }
      `}</style>
    </div>
  );
};

export default ChangePassword;
