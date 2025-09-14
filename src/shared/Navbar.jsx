import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa"; // icon menu

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  return (
    <nav className="bg-blue-600 text-white px-6 py-3 flex justify-between items-center relative">
      <h1 className="font-bold text-xl">Yahoo</h1>

      {/* menu cho màn hình lớn */}
      <div className="hidden sm:flex space-x-4 text-sm items-center">
        {token ? (
          <>
            <Link to="/" className="hover:scale-115">
              Trang cá nhân
            </Link>
            <Link to="/newsfeed" className="hover:scale-115">
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

      {/* nút menu nhỏ */}
      <button
        className="sm:hidden text-2xl"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* dropdown menu cho mobile */}
      {isOpen && (
        <div className="absolute top-full right-0 bg-blue-700 w-48 p-4 rounded-lg shadow-lg sm:hidden z-50">
          <div className="flex flex-col space-y-3 text-sm">
            {token ? (
              <>
                <Link
                  to="/"
                  className="hover:underline"
                  onClick={() => setIsOpen(false)}
                >
                  Trang cá nhân
                </Link>
                <Link
                  to="/newsfeed"
                  className="hover:underline"
                  onClick={() => setIsOpen(false)}
                >
                  Bảng tin
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hover:underline"
                  onClick={() => setIsOpen(false)}
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="hover:underline"
                  onClick={() => setIsOpen(false)}
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
