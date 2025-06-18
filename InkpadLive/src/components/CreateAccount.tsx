
import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import type { FC, FormEvent } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

type CreateAccountProps = {
  saveuser: (user: { name: string; id: string; username: string }) => void;
};

const CreateAccount: FC<CreateAccountProps> = ({saveuser}) => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const backend_base_url = import.meta.env.VITE_BACKEND_URL;
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    try {
      const response = await axios.post(
        `${backend_base_url}/api/auth/sign-up`,
        {
          name,
          email,
          password,
        }
      );
      // if (response.data.data.token) {
      //   document.cookie = `token=${response.data.data.token}; path=/; max-age=${
      //     60 * 60 * 24
      //   }; SameSite=Lax; Secure;`;
      //   // Optionally redirect or show success
      //   navigate("/sign-in");
      // }
      navigate("/sign-in");
    } catch (err) {
      setError("Account creation failed. Please try again.");
    }
    setLoading(false);
  };
  const handleGoogleLogin = async (credential: Credential) => {
    try {
      const response = await axios.post(
        `${backend_base_url}/api/auth/google`,
        credential
      );
      if (response.data.data.token) {
        saveuser({
          name: response.data.data.user.name,
          id: response.data.data.user._id.toString(),
          username: response.data.data.user.username,
        });
        document.cookie = `token=${response.data.data.token}; path=/; max-age=${
          60 * 60 * 24
        }; SameSite=Lax; Secure;`;
        navigate(`/home/:${response.data.data.user.username}`);
      }
    } catch (error) {
      setError("Login Failed");
    }
  };
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-50 via-pink-50 to-white">
      <div className="flex flex-col rounded-3xl shadow-2xl bg-white items-center px-10 py-8 w-full max-w-md relative overflow-hidden">
        {/* Decorative shape */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-green-100 rounded-full mix-blend-multiply opacity-60 pointer-events-none"></div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-pink-100 rounded-full mix-blend-multiply opacity-60 pointer-events-none"></div>
        {/* Logo */}
        <div className="h-16 flex items-center justify-center mb-2 z-10">
          <span className="text-3xl font-bold text-green-400 tracking-wide">
            Inkpad Live
          </span>
        </div>
        <h4 className="mb-6 text-2xl font-semibold text-green-600 z-10">
          Create your account
        </h4>
        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col items-center gap-3 z-10"
        >
          <input
            className="rounded-xl px-4 py-2 w-full text-lg border border-green-100 focus:border-green-400 focus:ring-2 focus:ring-green-100 transition outline-none"
            type="text"
            placeholder="Name"
            name="name"
            required
            autoComplete="name"
          />
          <input
            className="rounded-xl px-4 py-2 w-full text-lg border border-green-100 focus:border-green-400 focus:ring-2 focus:ring-green-100 transition outline-none"
            type="email"
            placeholder="Email"
            name="email"
            required
            autoComplete="username"
          />
          <input
            className="rounded-xl px-4 py-2 w-full text-lg border border-green-100 focus:border-green-400 focus:ring-2 focus:ring-green-100 transition outline-none"
            type="password"
            placeholder="Password"
            name="password"
            required
            autoComplete="new-password"
          />
          <button
            className="rounded-xl w-full py-2 text-lg font-semibold text-white bg-gradient-to-r from-green-400 to-pink-400 hover:from-green-500 hover:to-pink-500 transition mt-2 shadow"
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating..." : "Sign up"}
          </button>
        </form>
        {error && <div className="text-red-500 mt-2 text-sm z-10">{error}</div>}
        <div className="flex items-center my-4 w-full z-10">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="mx-3 text-gray-400 text-sm">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        {/* <button
          className="w-full py-2 rounded-xl bg-white border border-gray-200 hover:bg-green-50 text-gray-700 font-semibold transition mb-2 shadow flex items-center justify-center z-10"
          type="button"
        >
          <GoogleLogo />
          Sign up with Google
        </button> */}
        <GoogleLogin
          onSuccess={(credentialResponse) => {
            console.log(credentialResponse.credential);
            
            if (credentialResponse.credential){
              // console.log(jwtDecode(credentialResponse.credential))
              handleGoogleLogin(jwtDecode(credentialResponse.credential));}
          }}
          onError={() => console.log("Login Failed")}
        ></GoogleLogin>
        <Link to="/sign-in" className="w-full z-10">
          <p className="mt-2 text-center text-sm">
            Already have an account?{" "}
            <span className="text-green-500 hover:underline cursor-pointer">
              Sign In
            </span>
          </p>
        </Link>
      </div>
      {/* Custom color utilities for peach and pink if not in your Tailwind config */}
      <style>{`
        .bg-pink-100 { background-color: #ffe5ec; }
        .bg-green-100 { background-color: #d0f5df; }
        .from-pink-50 { --tw-gradient-from: #fff0f6; }
        .to-pink-50 { --tw-gradient-to: #fff0f6; }
      `}</style>
    </div>
  );
};

export default CreateAccount;
