import React, { useEffect, useState } from "react";
import PostList from "./PostList";

const API_BASE = "http://blogsystem.test/api";

const UserPosts1 = ({ userId }) => {
  const token = localStorage.getItem("authToken");
  const [currentUser, setCurrentUser] = useState(null);

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

  if (!currentUser && !userId) {
    return <p>Đang tải thông tin user...</p>;
  }
  const apiUrl = currentUser
    ? `${API_BASE}/users/${currentUser.id}/posts`
    : `${API_BASE}/users/${userId}/posts`;

  return (
    <PostList
      apiUrl={apiUrl}
      //title="Bài viết của bạn"
    />
  );
};

export default UserPosts1;