/**
 * Edit Profile Page
 * 
 * Allows users to update their name, email, and username.
 * Includes real-time availability checking for email and username.
 */
import {
  UserIcon,
  MailIcon,
  AtSignIcon,
  SaveIcon,
  XIcon,
  ArrowLeftIcon,
  CircleHelp,
  ImageIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

type User = {
  name: string;
  email: string;
  id: string;
  joinedOn: string;
  username: string;
  documentCount: number;
};

type Availability = {
  email: boolean | undefined;
  username: boolean | undefined;
};

const EditProfilePage = () => {
  const navigate = useNavigate();
  const backend_base_url = import.meta.env.VITE_BACKEND_URL;
  
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formDetails, setFormDetails] = useState({
    name: "",
    email: "",
    username: "",
  });
  const [canEdit, setCanEdit] = useState<Availability>({
    email: true,
    username: true,
  });
  const [emailWarning, setEmailWarning] = useState(false);
  const [imageWarning, setImageWarning] = useState(false);

  // Fetch user data on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${backend_base_url}/api/auth/me`);
        const userDetails = response.data.data.user;
        const userData: User = {
          name: userDetails.name,
          email: userDetails.email,
          username: userDetails.username,
          documentCount: userDetails.docs?.length || 0,
          id: userDetails._id.toString(),
          joinedOn: userDetails.createdAt,
        };
        setUser(userData);
        // Set form details AFTER user data is fetched
        setFormDetails({
          name: userData.name,
          email: userData.email,
          username: userData.username,
        });
      } catch (error) {
        console.error("Failed to fetch user:", error);
        navigate("/sign-in");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Email availability check with debounce
  useEffect(() => {
    if (!formDetails.email || formDetails.email === user?.email) {
      setCanEdit((prev) => ({ ...prev, email: true }));
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await axios.get(
          `${backend_base_url}/api/edit-profile/check-email?email=${formDetails.email}`
        );
        setCanEdit((prev) => ({ ...prev, email: res.data.available }));
      } catch {
        setCanEdit((prev) => ({ ...prev, email: undefined }));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [formDetails.email, user?.email]);

  // Username availability check with debounce
  useEffect(() => {
    if (!formDetails.username || formDetails.username === user?.username) {
      setCanEdit((prev) => ({ ...prev, username: true }));
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await axios.get(
          `${backend_base_url}/api/edit-profile/check-username?username=${formDetails.username}`
        );
        setCanEdit((prev) => ({ ...prev, username: res.data.available }));
      } catch {
        setCanEdit((prev) => ({ ...prev, username: undefined }));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [formDetails.username, user?.username]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormDetails((prev) => ({ ...prev, [name]: value }));
    if (["username", "email"].includes(name)) {
      setCanEdit((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // No changes made
    if (
      formDetails.name === user?.name &&
      formDetails.email === user?.email &&
      formDetails.username === user?.username
    ) {
      navigate("/profile");
      return;
    }
    
    // Validation failed
    if (canEdit.email === false || canEdit.username === false) {
      alert("Cannot update: email or username already in use");
      return;
    }
    
    try {
      await axios.post(`${backend_base_url}/api/edit-profile/`, {
        formDetails,
        oldEmail: user?.email,
      });
      alert("Profile updated successfully!");
      navigate("/profile");
    } catch (error) {
      console.error("Profile update failed:", error);
      alert("Failed to update profile");
    }
  };

  const handleReset = () => {
    if (user) {
      setFormDetails({
        name: user.name,
        email: user.email,
        username: user.username,
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="text-xl text-blue-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 h-48 absolute top-0 left-0" />
      <div className="relative pt-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
          {/* Header Section */}
          <div className="relative h-32 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-700">
            <button 
              onClick={() => navigate("/profile")}
              className="absolute top-4 left-4 text-white hover:text-blue-100 transition-colors duration-200 flex items-center"
            >
              <ArrowLeftIcon size={20} className="mr-2" />
              Back to Profile
            </button>
            <div className="absolute -bottom-12 left-8 flex items-end">
              <div className="h-24 w-24 rounded-2xl bg-white p-1 shadow-xl ring-4 ring-white group cursor-pointer hover:ring-blue-100 transition-all duration-200">
                <div
                  onMouseEnter={() => setImageWarning(true)}
                  onMouseLeave={() => setImageWarning(false)}
                  className="h-full w-full rounded-xl bg-gradient-to-r from-blue-100 to-blue-50 flex items-center justify-center relative overflow-hidden"
                >
                  <UserIcon size={40} className="text-blue-500 transform transition-transform group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <ImageIcon size={20} className="text-white" />
                  </div>
                </div>
              </div>
              <div className="mb-2 ml-6">
                {imageWarning && (
                  <span className="text-shadow-2xs text-red-200">
                    Cannot Upload Profile Photo Now
                  </span>
                )}
                <h1 className="text-2xl font-bold pb-3 text-white">Edit Profile</h1>
                <p className="text-blue-300">Update your personal information</p>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="pt-16 px-8 pb-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name Input */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <UserIcon size={16} className="mr-2 text-blue-500" />
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    onChange={handleChange}
                    value={formDetails.name}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <MailIcon size={16} className="mr-2 text-blue-500" />
                    Email
                    <span
                      className="pl-3"
                      onMouseEnter={() => setEmailWarning(true)}
                      onMouseLeave={() => setEmailWarning(false)}
                    >
                      <CircleHelp size={16} />
                    </span>
                    {emailWarning && (
                      <span className="text-shadow-2xs pl-1 text-red-200">
                        (you cannot change email used for Google Sign-In)
                      </span>
                    )}
                  </label>
                  <input
                    type="email"
                    name="email"
                    onChange={handleChange}
                    value={formDetails.email}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      canEdit.email === false && formDetails.email !== user?.email
                        ? "border-red-400"
                        : "border-gray-200"
                    } focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200`}
                    placeholder="Enter your email"
                  />
                  {canEdit.email === false && formDetails.email !== user?.email && (
                    <p className="text-red-400">Email already in use</p>
                  )}
                </div>

                {/* Username Input */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <AtSignIcon size={16} className="mr-2 text-blue-500" />
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    onChange={handleChange}
                    value={formDetails.username}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      canEdit.username === false && formDetails.username !== user?.username
                        ? "border-red-400"
                        : "border-gray-200"
                    } focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200`}
                    placeholder="Choose a username"
                  />
                  {canEdit.username === false && formDetails.username !== user?.username && (
                    <p className="text-red-400">Username already taken</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-4 pt-6">
                <button
                  onClick={handleReset}
                  type="button"
                  className="flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow"
                >
                  <XIcon size={18} className="mr-2" />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <SaveIcon size={18} className="mr-2" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;
