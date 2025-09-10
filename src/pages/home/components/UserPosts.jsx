import React, { useEffect, useState, useCallback, useRef } from "react";
import EditPost from "./EditPost";
import DeleteConfirmModal from "./DeleteConfirmModal";
import ViewPostModal from "./ViewPostModal";

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
  const [activePostId, setActivePostId] = useState(null); // Sửa từ false thành null, dùng để quản lý menu

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

  // --- Xử lý xóa từ modal ---
  const handleDeleteConfirm = (id) => {
    setPosts(posts.filter((p) => p.id !== id));
    setDeletingPost(null);
    setActivePostId(null); // Đóng menu sau khi xóa
  };

  // --- Toggle menu 3 chấm ---
  const menuRef = useRef(null);
  const toggleMenu = (postId) => {
    setActivePostId(activePostId === postId ? null : postId); // Toggle menu
  };

  // --- Đóng menu khi click ra ngoài ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActivePostId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return <p>Đang tải thông tin user...</p>;

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">Bài viết của bạn</h2>

      {posts.map((post) => (
        <div key={post.id} className="bg-white shadow-md shadow-blue-300 rounded-lg p-4 mb-4">
          {/* Header user info */}
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-2">
              <img
                src={`http://blogsystem.test/storage/${user?.avatar || "avatar/default.jpg"}`}
                alt="avatar"
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-semibold">{user.name || user.email}</p> {/* Ưu tiên name, fallback email */}
                <p className="text-gray-500 text-sm">{post.category?.name}</p>
              </div>
            </div>

            {/* Menu 3 chấm */}
            <div className="relative" ref={activePostId === post.id ? menuRef : null}>
              <button
                className="text-gray-500 hover:text-gray-700 p-2 cursor-pointer font-bold"
                onClick={() => toggleMenu(post.id)}
              >
                ⋮
              </button>
              {activePostId === post.id && (
                <div className="w-35 absolute right-0 mt-2 bg-white rounded shadow-lg">
                  <button
                    className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                    onClick={() => {
                      setEditingPost(post);
                      setActivePostId(null); // Đóng menu khi mở edit
                    }}
                  >
                    ✏️ Chỉnh sửa
                  </button>
                  <button
                    className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                    onClick={() => {
                      setDeletingPost(post);
                      setActivePostId(null); // Đóng menu khi mở delete
                    }}
                  >
                    🗑️ Xóa
                  </button>
                </div>
              )}
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
              onClick={() => {
                setViewingPost(post);
                setActivePostId(null); // Đóng menu khi mở view
              }}
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
        <EditPost
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onUpdated={(updated) =>
            setPosts(posts.map((p) => (p.id === updated.id ? updated : p)))
          }
        />
      )}

      {/* Modal xóa */}
      {deletingPost && (
        <DeleteConfirmModal
          post={deletingPost}
          onClose={() => setDeletingPost(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}

      {/* Modal chi tiết + comments */}
      {viewingPost && (
        <ViewPostModal 
          post={viewingPost}
          onClose={() => setViewingPost(null)}
        />  
      )}
    </div>
  );
};

export default UserPosts;