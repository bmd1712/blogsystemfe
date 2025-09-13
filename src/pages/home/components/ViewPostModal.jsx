import React, { useEffect, useState } from "react";

const API_BASE = "http://blogsystem.test/api";

const ViewPostModal = ({ post, onClose, onCommentCountChange }) => {
  const token = localStorage.getItem("authToken");
  const [currentUser, setCurrentUser] = useState(null);

  const [comments, setComments] = useState([]);       // danh sách cmt đang hiển thị
  const [page, setPage] = useState(1);                // page khi bấm "Xem thêm"
  const [lastPage, setLastPage] = useState(1);        // tổng page từ API
  const [total, setTotal] = useState(post.comments_count); // tổng cmt (truyền sẵn từ PostItem)
  const [loadingMore, setLoadingMore] = useState(false);
  const [newComment, setNewComment] = useState("");

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

  // Khi mở modal: lấy 3 cmt mới nhất
  useEffect(() => {
    const fetchFirstComments = async () => {
      try {
        const res = await fetch(`${API_BASE}/posts/${post.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Không thể tải bình luận");
        const data = await res.json();
        // API này trả về post kèm 3 cmt mới nhất trong data.comments
        setComments(data.comments || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchFirstComments();
  }, [post.id, token]);

  // Xem thêm bình luận
  const loadMoreComments = async () => {
    if (loadingMore || page > lastPage) return;
    setLoadingMore(true);
    try {
      const res = await fetch(
        `${API_BASE}/posts/${post.id}/comments?page=${page}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Không thể tải thêm bình luận");
      const data = await res.json();
      setComments(prev => {
        // gộp và lọc trùng theo id
        const merged = [...prev, ...data.data];
        return merged.filter(
          (c, idx, self) => idx === self.findIndex(x => x.id === c.id)
        );
      });
      setLastPage(data.last_page);
      setPage(p => p + 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Gửi bình luận mới
  const submitComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/posts/${post.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newComment }),
      });
      if (!res.ok) throw new Error("Lỗi khi gửi bình luận");
      const created = await res.json();
      setComments(prev => [created, ...prev]);
      setTotal(t => t + 1);
      onCommentCountChange?.(total + 1); // 🔹 cập nhật ra ngoài
      setNewComment("");
    } catch (err) {
      console.error(err);
    }
  };

  // Xoá comment
  const deleteComment = async (commentId) => {
    if (!window.confirm("Xoá bình luận này?")) return;
    try {
      const res = await fetch(`${API_BASE}/comments/${commentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Không thể xoá bình luận");
      setComments(prev => prev.filter(c => c.id !== commentId));
      setTotal(t => t - 1);
      onCommentCountChange?.(total - 1); // cập nhật ra ngoài
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center overflow-y-auto z-50">
      <div className="bg-white p-6 rounded-lg w-[600px] max-h-[90vh] overflow-y-auto">
        {/* Nội dung bài viết */}
        <h3 className="text-lg font-bold mb-4">{post.title}</h3>
        {post.image && (
          <img
            src={`http://blogsystem.test/storage/${post.image}`}
            alt={post.title}
            className="rounded mb-4 w-full max-h-64 object-cover"
          />
        )}
        <p className="mb-4">{post.content}</p>

        {/* Bình luận */}
        <h4 className="font-semibold mb-2">
          Đang hiển thị {comments.length} / {total} bình luận
        </h4>

        {comments.length > 0 ? (
          comments.map((c) => (
            <div key={c.id} className="border-b py-2 flex justify-between">
              <div>
                <p className="font-semibold">{c.user?.name}</p>
                <p className="text-sm text-gray-600">{c.content}</p>
              </div>
              {(currentUser?.id === c.user_id || currentUser?.id === post.user_id) && (
                <button
                  className="text-red-500 text-sm hover:underline"
                  onClick={() => deleteComment(c.id)}
                >
                  Xoá
                </button>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500">Chưa có bình luận</p>
        )}

        {/* Nút xem thêm */}
        {page <= lastPage && comments.length < total && (
          <button
            onClick={loadMoreComments}
            disabled={loadingMore}
            className="text-blue-500 hover:underline mt-2"
          >
            {loadingMore ? "Đang tải..." : "Xem thêm bình luận"}
          </button>
        )}

        {/* Thêm bình luận */}
        <div className="mt-4">
          <input
            className="w-full border rounded p-2"
            rows="2"
            placeholder="Viết bình luận..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          ></input>
          <button
            onClick={submitComment}
            className="bg-blue-500 text-white px-4 py-2 mt-2 rounded"
          >
            Gửi
          </button>
        </div>

        {/* Đóng modal */}
        <div className="flex justify-end mt-4">
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded"
            onClick={onClose}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewPostModal;
