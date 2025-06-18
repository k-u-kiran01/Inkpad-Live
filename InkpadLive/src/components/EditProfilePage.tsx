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
import { Link } from "react-router-dom";
const EditProfilePage = () => {
  const backend_base_url = import.meta.env.VITE_BACKEND_URL;
  type user = {
    name: string;
    email: string;
    id: string;
    joinedOn: string;
    username: string;
    documentCount: number;
  };
  type availability = {
    email: boolean | undefined;
    username: boolean | undefined;
  };
  const [user, setUser] = useState<user>();
  const [formDetails, setformDetails] = useState<{
    name: string;
    email: string;
    username: string;
  }>({ name: "", email: "", username: "" });
  const [canEdit, setCanEdit] = useState<availability>({
    email: true,
    username: true,
  });

  const [emailWarning, setEmailWarning] = useState(false);
  const [imageWarning, setImageWarning] = useState(false);
  const fetchUser = async () => {
    try {
      const response = await axios.get(`${backend_base_url}/api/auth/me`);
      const userDetails = response.data.data.user;
      setUser({
        name: userDetails.name,
        email: userDetails.email,
        username: userDetails.username,
        documentCount: userDetails.docs.length,
        id: userDetails._id.toString(),
        joinedOn: userDetails.createdAt,
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchUser();
    setformDetails({
      name: user?.name as string,
      email: user?.email as string,
      username: user?.email as string,
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      formDetails.name === user?.name &&
      formDetails.email === user?.email &&
      formDetails.username === user?.username
    ) {
      return;
    }
    if (!canEdit.email || !canEdit.username) {
      alert("Cannot Edit User Details");
      return;
    } else {
      try {
        await axios.post(`${backend_base_url}/api/edit-profile/`, {
          formDetails,
          oldEmail: user?.email,
        });
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    if (!formDetails.email) return;
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
  }, [formDetails.email]);

  useEffect(() => {
    if (!formDetails.username) return;
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
  }, [formDetails.username]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // console.log(e.target.value);
    const { name, value } = e.target;
    setformDetails((prev) => ({ ...prev, [name]: value }));
    if (["username", "email"].includes(name)) {
      setCanEdit((prev) => ({ ...prev, [name]: null }));
    }
  };
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 h-48 absolute top-0 left-0" />
      <div className="relative pt-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
          {/* Header Section */}
          <div className="relative h-32 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-700">
            <Link to={"/profile"}>
              <button className="absolute top-4 left-4 text-white hover:text-blue-100 transition-colors duration-200 flex items-center">
                <ArrowLeftIcon size={20} className="mr-2" />
                Back to Profile
              </button>
            </Link>
            <div className="absolute -bottom-12 left-8 flex items-end">
              <div className="h-24 w-24 rounded-2xl bg-white p-1 shadow-xl ring-4 ring-white group cursor-pointer hover:ring-blue-100 transition-all duration-200">
                <div
                  onMouseEnter={() => setImageWarning(true)}
                  onMouseLeave={() => setImageWarning(false)}
                  className="h-full w-full rounded-xl bg-gradient-to-r from-blue-100 to-blue-50 flex items-center justify-center relative overflow-hidden"
                >
                  <UserIcon
                    size={40}
                    className="text-blue-500 transform transition-transform group-hover:scale-110"
                  />
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
                <h1 className="text-2xl font-bold pb-3 text-white">
                  Edit Profile
                </h1>
                <p className="text-blue-300">
                  Update your personal information
                </p>
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
                    Email{" "}
                    <span
                      className="pl-3"
                      onMouseEnter={() => setEmailWarning(true)}
                      onMouseLeave={() => {
                        setEmailWarning(false);
                      }}
                    >
                      <CircleHelp />
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
                    className={`w-full px-4 py-3 rounded-xl border  ${
                      canEdit.email === false &&
                      formDetails.email !== user?.email
                        ? "border-red-400"
                        : "border-gray-200"
                    } focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200`}
                    placeholder="Enter your email"
                  />
                  {canEdit.email === false &&
                    formDetails.email !== user?.email && (
                      <p className="text-red-400">Email already in use, yo!</p>
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
                    className={`w-full px-4 py-3 rounded-xl border  ${
                      canEdit.username === false &&
                      formDetails.username !== user?.username
                        ? "border-red-400"
                        : "border-gray-200"
                    } focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200`}
                    placeholder="Choose a username"
                  />
                  {canEdit.username === false &&
                    formDetails.username !== user?.username && (
                      <p className="text-red-400">
                        Username already taken, yo!
                      </p>
                    )}
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-4 pt-6">
                <button
                  onClick={() => {
                    console.log(user);

                    setformDetails({
                      email: user?.email as string,
                      username: user?.username as string,
                      name: user?.name as string,
                    });
                  }}
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
