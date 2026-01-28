import LoginPage from "./components/LoginPage";
import LandingPage from "./components/LandingPage";
import CreateAccount from "./components/CreateAccount";
import ChangePassword from "./components/ChangePassword";
import HomePage from "./components/HomePage";
import ProfilePage from "./components/Profile";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import io, { Socket } from "socket.io-client";
import axios from "axios";
import { createContext, useEffect, useState } from "react";
import EditDocument from "./components/EditDocument";
import EditProfilePage from "./components/EditProfilePage";

const backend_base_url = import.meta.env.VITE_BACKEND_URL;

// Socket instance with autoConnect disabled - connected manually per document
const socket: typeof Socket = io.connect(`${backend_base_url}`, {
  autoConnect: false,
});

interface user {
  name: string;
  id: string;
  username: string;
}

// User context - null until auth check completes
export const userContext = createContext<user | null>(null);

/**
 * Root App component
 * - Checks authentication on mount before rendering routes
 * - Provides user context to all child components
 */
const App = () => {
  const [user, setUser] = useState<user | null>(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  // Enable credentials for cross-origin cookie handling
  axios.defaults.withCredentials = true;

  // Callback to update user state after login/signup
  const saveuser = ({ name, id, username }: user) => {
    setUser({ name, id, username });
  };

  // Check authentication status on app load
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${backend_base_url}/api/auth/me`);
        setUser({
          name: res.data.data.user.name,
          id: res.data.data.user._id.toString(),
          username: res.data.data.user.username,
        });
      } catch {
        // Auth failed - set as guest user
        setUser({
          name: "guest",
          id: "guest1234567890",
          username: "guest",
        });
      } finally {
        setIsAuthChecked(true);
      }
    };
    fetchUser();
  }, []);

  // Wait for auth check to complete before rendering
  // This prevents socket from joining with incorrect user identity
  if (!isAuthChecked || user === null) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#e0e0e0] to-[#f8f8f8]">
        <div className="text-xl text-[#3d5a80]">Loading...</div>
      </div>
    );
  }

  return (
    <userContext.Provider value={user}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/sign-in" element={<LoginPage saveuser={saveuser} />} />
          <Route path="/sign-up" element={<CreateAccount saveuser={saveuser} />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/home/:id" element={<HomePage />} />
          <Route path="/md/:docId" element={<EditDocument socket={socket} />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/edit-profile" element={<EditProfilePage />} />
        </Routes>
      </BrowserRouter>
    </userContext.Provider>
  );
};

export default App;
