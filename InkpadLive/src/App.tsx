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
const backend_base_url = import.meta.env.VITE_BACKEND_URL;
const socket: typeof Socket = io.connect(`${backend_base_url}`, {
  autoConnect: false,
});

import EditDocument from "./components/EditDocument";
import EditProfilePage from "./components/EditProfilePage";
interface user {
  name: string;
  id: string;
  username: string;
}
export const userContext = createContext<user>({
  name: "guest",
  id: "guest",
  username: "guest",
});

const App = () => {
  const [user, setUser] = useState<user>({ name: "", id: "", username: "" });
  const getCookie = (name: string): string | null => {
    const cookies = document.cookie.split("; ");
    for (let cookie of cookies) {
      const [key, val] = cookie.split("=");
      if (key === name) return decodeURIComponent(val);
    }
    return null;
  };
  axios.interceptors.request.use(
    (config) => {
      const token = getCookie("token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  const saveuser = ({ name, id, username }: user) => {
    setUser({ name: name, id: id, username: username });
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${backend_base_url}/api/auth/me`);
        const user: user = {
          name: res.data.data.user.name,
          id: res.data.data.user._id.toString(),
          username: res.data.data.user.username,
        };
        //console.log(user);
        setUser(user);
      } catch (error) {
        const user: user = {
          name: "guest",
          id: "guest1234567890",
          username: "guest",
        };
        // console.log(user);
        setUser(user);
      }
    };
    fetchUser();
  }, []);
  return (
    <userContext.Provider value={user}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/sign-in" element={<LoginPage saveuser={saveuser} />} />
          <Route
            path="/sign-up"
            element={<CreateAccount saveuser={saveuser} />}
          />

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
