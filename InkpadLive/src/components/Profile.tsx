import axios from 'axios';
import { UserIcon, MailIcon, AtSignIcon, ArrowLeftIcon, CalendarIcon, FileTextIcon, LockIcon, LogOutIcon, EditIcon, BadgeCheckIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
const ProfilePage = () => {
  const backend_base_url = import.meta.env.VITE_BACKEND_URL
  const navigate = useNavigate()

  type user = {
    name: string,
    email: string,
    id: string,
    joinedOn: string,
    username: string,
    documentCount: number
  }
  const [user,setUser] = useState<user>()
  const handleLogout = () => {
    document.cookie = "token=; path=/; max-age=0; SameSite=Lax; Secure;";
    navigate("/");
  };
  const fetchUser = async ()=>{
    try{
      const response = await axios.get(`${backend_base_url}/api/auth/me`)
      const userDetails = response.data.data.user
      setUser({name:userDetails.name,email:userDetails.email,username:userDetails.username,documentCount:userDetails.docs.length,id:userDetails._id.toString(),joinedOn:userDetails.createdAt})
    }catch(error){
      console.log(error)
    }
  }
  useEffect(()=>{
    fetchUser();    
  },[])
  return <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 h-48 absolute top-0 left-0" />
      <div className="relative pt-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
          {/* Header Section */}
          <div className="relative h-32 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-700">
            <Link to={`/home/:${user?.id}`}>
            <button className="absolute top-4 left-4 text-white hover:text-blue-100 transition-colors duration-200 flex items-center">
              <ArrowLeftIcon size={20} className="mr-2" />
              HOME
            </button>
            </Link>
            <div className="absolute -bottom-12 left-8 flex items-end">
              <div className="h-24 w-24 rounded-2xl bg-white p-1 shadow-xl ring-4 ring-white">
                <div className="h-full w-full rounded-xl bg-gradient-to-r from-blue-100 to-blue-50 flex items-center justify-center relative overflow-hidden">
                  <UserIcon size={40} className="text-blue-500 transform transition-transform group-hover:scale-110" />
                  <div className="absolute bottom-1 right-1 h-3 w-3 bg-green-400 rounded-full ring-2 ring-white" />
                </div>
              </div>
              <div className="mb-2 ml-6">
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold text-blue-500 flex items-center">
                    {user?.name}
                    <BadgeCheckIcon size={20} className="ml-2 text-blue-200" />
                  </h1>
                </div>
                {/* <p className="text-blue-100 flex items-center">
                  <ActivityIcon size={14} className="mr-1" />
                  {userData.status}
                </p> */}
              </div>
            </div>
          </div>
          {/* Main Content */}
          <div className="pt-16 px-8 pb-8">
            
            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoItem icon={<UserIcon size={20} />} label="Name" value={user?.name} />
              <InfoItem icon={<MailIcon size={20} />} label="Email" value={user?.email} />
              <InfoItem icon={<AtSignIcon size={20} />} label="Username" value={user?.username} />
              <InfoItem icon={<CalendarIcon size={20} />} label="Joined On" value={user?.joinedOn} />
              <InfoItem icon={<FileTextIcon size={20} />} label="Documents" value={`${user?.documentCount} documents created`} />
              <InfoItem icon={<UserIcon size={20} />} label="User ID" value={user?.id} />
            </div>
            {/* Action Buttons */}
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link to={'/edit-profile'}>
              <button className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                <EditIcon size={18} className="mr-2" />
                Edit Profile
              </button>
              </Link>
              <Link to={'/change-password'}>
              <button className="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                <LockIcon size={18} className="mr-2" />
                Change Password
              </button>
              </Link>
              <button onClick={handleLogout} className="flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                <LogOutIcon size={18} className="mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
const InfoItem = ({
  icon,
  label,
  value
}:{icon:any, label:any, value:any}) => <div className="flex items-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-200">
    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
      <div className="text-blue-600">{icon}</div>
    </div>
    <div className="ml-4">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-gray-900 font-semibold">{value}</p>
    </div>
  </div>;
export default ProfilePage;