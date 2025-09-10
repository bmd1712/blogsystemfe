import React, { useEffect, useState } from "react";
import PostList from "./PostList";

const API_BASE = "http://blogsystem.test/api";

const UserPosts1 = ({ userId }) => {
  const token = localStorage.getItem("authToken");
  const [currentUser, setCurrentUser] = useState(null);

  // Lấy user hiện tại
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_BASE}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Lỗi xác thực");
        const data = await res.json();
        setCurrentUser(data);
      } catch (err) {
        console.error("Lỗi lấy user:", err);
      }
    };
    if (token) fetchUser();
  }, [token]);

  // Xây dựng apiUrl dựa trên currentUser.id (ưu tiên nếu có)
  const apiUrl = currentUser
    ? `${API_BASE}/users/${currentUser.id}/posts`
    : userId
    ? `${API_BASE}/users/${userId}/posts`
    : null;

  return (
    <PostList
      apiUrl={apiUrl}
      title="Bài viết của bạn"
    />
  );
};

export default UserPosts1;