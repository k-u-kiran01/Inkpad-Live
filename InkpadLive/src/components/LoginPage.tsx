

import { useState } from "react";
import type { FC, FormEvent } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

const backend_base_url = import.meta.env.VITE_BACKEND_URL;

type LoginPageProps = {
  saveuser: (user: { name: string; id: string; username: string }) => void;
};

const LoginPage: FC<LoginPageProps> = ({ saveuser }) => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    try {
      const response = await axios.post(
        `${backend_base_url}/api/auth/sign-in`,
        { email, password }
      );
      if (response.data.data.user) {
        saveuser({
          name: response.data.data.user.name,
          id: response.data.data.user._id.toString(),
          username: response.data.data.user.username,
        });
        // document.cookie = `token=${response.data.data.token}; path=/; max-age=${
        //   60 * 60 * 24
        // }; SameSite=Lax; Secure;`;
        navigate(`/home/:${response.data.data.user.username}`);
      }
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    }
    setLoading(false);
  };
  const handleGoogleLogin = async (credential:Credential)=>{
    try{
      const response =await axios.post(`${backend_base_url}/api/auth/google`,credential);
      if(response.data.data.token){
        saveuser({
          name: response.data.data.user.name,
          id: response.data.data.user._id.toString(),
          username: response.data.data.user.username,
        });
        // document.cookie = `token=${response.data.data.token}; path=/; max-age=${
        //   60 * 60 * 24
        // }; SameSite=Lax; Secure;`;
        navigate(`/home/:${response.data.data.user.username}`);
      }
    }catch(error){
      setError("Login Failed")
    }
  }
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-peach-50">
      <div className="flex flex-col rounded-2xl shadow-2xl bg-white items-center px-10 py-8 w-full max-w-md transition hover:shadow-blue-200">
        <div className="h-16 flex items-center justify-center mb-2">

          <span className="text-3xl font-bold text-blue-400 tracking-wide">
            Inkpad Live
          </span>
        </div>
        <h4 className="mb-6 text-2xl font-semibold text-blue-600">
          Sign in to your account
        </h4>
        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col items-center gap-3"
        >
          <input
            className="rounded-xl px-4 py-2 w-full text-lg border border-blue-100 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition outline-none"
            type="email"
            placeholder="Email"
            name="email"
            required
            autoComplete="username"
          />
          <input
            className="rounded-xl px-4 py-2 w-full text-lg border border-blue-100 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition outline-none"
            type="password"
            placeholder="Password"
            name="password"
            required
            autoComplete="current-password"
          />
          <button
            className="rounded-xl w-full py-2 text-lg font-semibold text-white bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-500 hover:to-purple-500 transition mt-2 shadow"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        {error && <div className="text-red-500 mt-2 text-sm">{error}</div>}
        <div className="flex items-center my-4 w-full">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="mx-3 text-gray-400 text-sm">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        {/* <button
          className="w-full py-2 rounded-xl bg-peach-100 hover:bg-peach-200 text-blue-700 font-semibold transition mb-2 shadow"
          type="button" 
        >
          Sign in with Google
        </button> */}
        <GoogleLogin
          onSuccess={(credentialResponse) => {
            if (credentialResponse.credential){
              handleGoogleLogin(jwtDecode(credentialResponse.credential));
              // console.log(jwtDecode(credentialResponse.credential));
            }
          }}
          onError={() => console.log("Login Failed")}
        ></GoogleLogin>
        <Link to="/sign-up" className="w-full">
          <p className="mt-2 text-center text-sm">
            Don't have an account?{" "}
            <span className="text-blue-500 hover:underline cursor-pointer">
              Sign Up
            </span>
          </p>
        </Link>
        <Link to="/change-password" className="w-full">
          <p className="mt-2 text-center text-sm">
            Forgot password?{" "}
            <span className="text-purple-500 hover:underline cursor-pointer">
              Change Password
            </span>
          </p>
        </Link>
      </div>
      {/* Custom peach color utility if not in your Tailwind config */}
      <style>{`
        .bg-peach-100 { background-color: #ffe5b4; }
        .hover\\:bg-peach-200:hover { background-color: #ffd59a; }
        .to-peach-50 { --tw-gradient-to: #fff3e0; }
      `}</style>
    </div>
  );
};

export default LoginPage;
