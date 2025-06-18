import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaSignOutAlt } from "react-icons/fa";


const UserDropdown = ({ name }: {name:string} ) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    document.cookie = "token=; path=/; max-age=0; SameSite=Lax; Secure;";
    navigate("/");
  };
  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        className="flex items-center gap-2 font-medium text-gray-800 hover:text-blue-600"
        onClick={() => {
          setOpen(!open);
          // console.log(user);
        }}
      >
        <FaUser className="text-lg" />
        <span className="sm:block">{name}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-md z-50">
          <button
            onClick={() => {
              setOpen(false);
              navigate("/profile");
            }}
            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
          >
            <FaUser /> Profile
          </button>
          {/* <button
            onClick={() => {
              setOpen(false);
              navigate("/settings");
            }}
            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
          >
            <FaCog /> Settings
          </button> */}
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100 flex items-center gap-2"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      )}
    </div>
  );
};

export const Header = ({ name }: { name: string }) => {
  return (
    <header className="w-full flex justify-between items-center px-6 py-4 bg-white shadow-sm z-50">
      <Link to="/">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-xl">
          {/* <span className="text-2xl">📄</span> */}
          <span>Inkpad Live</span>
        </div>
      </Link>
      <UserDropdown name={name} />
    </header>
  );
};

export default Header;
