import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  return (
    <nav className="bg-blue-600 text-white px-6 py-3 flex justify-between items-center">
      <h1 className="font-bold text-lg">Yahoo</h1>
      <div className="space-x-4">
        {token ? (
          <>
            <Link to="/" className="hover:underline">
              Trang cá nhân
            </Link>
            <Link to="/newsfeed" className="hover:underline">
              Bảng tin
            </Link>
            
            <button
              onClick={handleLogout}
              className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
            >
              Đăng xuất
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:underline">
              Đăng nhập
            </Link>
            <Link to="/register" className="hover:underline">
              Đăng ký
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
