import React, { useEffect, useState, useCallback } from "react";
import PostItem from "./PostItem";

const API_BASE = "http://blogsystem.test/api";

const PostList = ({ apiUrl, title }) => {
  const token = localStorage.getItem("authToken");
  const [currentUser, setCurrentUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

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

  // Lấy bài viết
  const fetchPosts = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}?page=${page}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Không thể tải posts");

      const data = await res.json();
      setPosts((prev) => [...prev, ...data.data]);
      setHasMore(data.next_page_url !== null);
      setPage((prev) => prev + 1);
    } catch (err) {
      console.error("Lỗi lấy posts:", err);
    } finally {
      setLoading(false);
    }
  }, [page, hasMore, loading, token, apiUrl]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Scroll load thêm
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 200
      ) {
        fetchPosts();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [fetchPosts]);

  if (!currentUser) return <p>Đang tải thông tin user...</p>;

  //lọc trùng trước khi render
  const uniquePosts = posts.filter(
    (post, index, self) => index === self.findIndex(p => p.id === post.id)
  );

  return (
    <div className="mt-6">
      {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}

      {uniquePosts.map((post) => (
        <PostItem key={post.id} post={post} currentUser={currentUser} />
      ))}

      {loading && <p>Đang tải thêm...</p>}
      {!hasMore && <p className="text-gray-500 text-center">Hết bài viết</p>}
    </div>
  );
};

export default PostList;
