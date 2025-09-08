import React, { useEffect, useState, useCallback } from "react";

const API_BASE = "http://blogsystem.test/api";

const UserPosts = () => {
  const token = localStorage.getItem("authToken");
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // Modal state
  const [editingPost, setEditingPost] = useState(null);
  const [deletingPost, setDeletingPost] = useState(null);
  const [viewingPost, setViewingPost] = useState(null);

  // --- Lấy user từ token ---
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_BASE}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Lỗi xác thực");
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error("Lỗi lấy user:", err);
      }
    };
    if (token) fetchUser();
  }, [token]);

  // --- Lấy bài viết cá nhân ---
  const fetchPosts = useCallback(async () => {
    if (!user || loading || !hasMore) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/users/${user.id}/posts?page=${page}`, {
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
  }, [user, page, hasMore, loading, token]);

  useEffect(() => {
    if (user) fetchPosts();
  }, [user]);

  // --- Scroll load thêm ---
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
        fetchPosts();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [fetchPosts]);

  // --- Gọi API xóa ---
  const deletePost = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/posts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Xóa thất bại");
      setPosts(posts.filter((p) => p.id !== id));
      setDeletingPost(null);
    } catch (err) {
      console.error("Lỗi xóa:", err);
      alert("Không thể xóa bài viết");
    }
  };

  if (!user) return <p>Đang tải thông tin user...</p>;

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">Bài viết của bạn</h2>

      {posts.map((post) => (
        <div key={post.id} className="bg-white shadow rounded-lg p-4 mb-4">
          {/* Header user info */}
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-2">
              <img
                src={ `http://blogsystem.test/storage/${user?.avatar || "avatar/default.jpg"}`}
                alt="avatar"
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-semibold">{user.email}</p>
                <p className="text-gray-500 text-sm">{post.category?.name}</p>
              </div>
            </div>

            {/* Menu 3 chấm */}
            <div className="relative">
              <button
                className="text-gray-500 hover:text-gray-700 p-2 cursor-pointer font-bold"
                onClick={() => {
                  const menu = document.getElementById(`menu-${post.id}`);
                  menu.classList.toggle("hidden");
                }}
              >
                ⋮
              </button>
              <div
                id={`menu-${post.id}`}
                className="hidden absolute right-0 mt-2 bg-white border rounded shadow-md"
              >
                <button
                  className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                  onClick={() => setEditingPost(post)}
                >
                  ✏️ Chỉnh sửa
                </button>
                <button
                  className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                  onClick={() => setDeletingPost(post)}
                >
                  🗑️ Xóa
                </button>
              </div>
            </div>
          </div>

          {/* Image */}
          {post.image && (
            <img
              src={`http://blogsystem.test/storage/${post.image}`}
              alt={post.title}
              className="rounded-md my-3"
            />
          )}

          {/* Content */}
          <p>{post.content}</p>

          {/* Actions */}
          <div className="flex space-x-4 mt-3 text-gray-600">
            <button className="hover:text-blue-500">👍 Like</button>
            <button
              className="hover:text-blue-500"
              onClick={() => setViewingPost(post)}
            >
              💬 Comment
            </button>
          </div>
        </div>
      ))}

      {loading && <p>Đang tải thêm...</p>}
      {!hasMore && <p className="text-gray-500 text-center">Hết bài viết</p>}

      {/* Modal sửa */}
      {editingPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-bold mb-4">Chỉnh sửa bài viết</h3>
            <textarea
              className="w-full border p-2 rounded"
              defaultValue={editingPost.content}
            ></textarea>
            <div className="flex justify-end mt-4 space-x-2">
              <button onClick={() => setEditingPost(null)}>Hủy</button>
              <button className="bg-blue-500 text-white px-4 py-2 rounded">
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xóa */}
      {deletingPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-80">
            <h3 className="text-lg font-bold mb-4">Xóa bài viết?</h3>
            <p>Bạn có chắc chắn muốn xóa bài viết này?</p>
            <div className="flex justify-end mt-4 space-x-2">
              <button onClick={() => setDeletingPost(null)}>Hủy</button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={() => deletePost(deletingPost.id)}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal chi tiết + comments */}
      {viewingPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center overflow-y-auto">
          <div className="bg-white p-6 rounded-lg w-[600px]">
            <h3 className="text-lg font-bold mb-4">{viewingPost.title}</h3>
            {viewingPost.image && (
              <img
                src={`http://blogsystem.test/storage/${viewingPost.image}`}
                alt={viewingPost.title}
                className="rounded mb-4"
              />
            )}
            <p className="mb-4">{viewingPost.content}</p>

            <h4 className="font-semibold mb-2">Bình luận</h4>
            {viewingPost.comments?.length > 0 ? (
              viewingPost.comments.map((c) => (
                <div key={c.id} className="border-b py-2">
                  <p className="font-semibold">{c.user?.name}</p>
                  <p>{c.content}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Chưa có bình luận</p>
            )}

            <div className="flex justify-end mt-4">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded"
                onClick={() => setViewingPost(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPosts;
