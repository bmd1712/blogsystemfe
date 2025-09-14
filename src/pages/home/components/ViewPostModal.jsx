import React, { useEffect, useState } from "react";
import { FaRegCircleXmark, FaRegTrashCan, FaRegPaperPlane } from "react-icons/fa6";

const API_BASE = "http://blogsystem.test/api";

const ViewPostModal = ({ post, onClose, onCommentCountChange }) => {
  const token = localStorage.getItem("authToken");
  const [currentUser, setCurrentUser] = useState(null);

  const [comments, setComments] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(post.comments_count);
  const [loadingMore, setLoadingMore] = useState(false);
  const [newComment, setNewComment] = useState("");

  // Disable scroll outside
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "auto"; };
  }, []);

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
        setComments(data.comments || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchFirstComments();
  }, [post.id, token]);

  // Xem thêm
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
        const merged = [...prev, ...data.data];
        return merged.filter((c, i, self) => i === self.findIndex(x => x.id === c.id));
      });
      setLastPage(data.last_page);
      setPage(p => p + 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Gửi bình luận
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

      const enrichedComment = {
        ...created,
        user: {
          id: currentUser.id,
          email: currentUser.email,
          avatar: currentUser.avatar,
        },
      };

      setComments(prev => [enrichedComment, ...prev]);
      setTotal(t => t + 1);
      onCommentCountChange?.(total + 1);
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
      onCommentCountChange?.(total - 1);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white bg-opacity-95 rounded-lg w-[600px] max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-2  bg-gray-100">
          <h3 className="font-bold">Bài viết của {post.user?.email}</h3>
          <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                <FaRegCircleXmark size={24} />
            </button>
        </div>
        <div className="flex px-4 pt-4 items-center space-x-2">
          <img
            src={`http://blogsystem.test/storage/${post.user?.avatar || "avatar/default.jpg"}`}
            alt="avatar"
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="font-semibold">{post.user?.email}</p>
            <div className="">
            <p className="text-gray-500 text-sm ">
                {post.category?.name || ""}
            </p>
            {/* <h4 className="text-gray-500 text-sm mb-2">{post.title}</h4> */}
            </div>
          </div>
        </div>
        {/* Nội dung */}
        <div className="p-4 overflow-y-auto flex-1">
          
          <p className="mb-4">{post.content}</p>
          {post.image && (
            <img
              src={`http://blogsystem.test/storage/${post.image}`}
              alt={post.title}
              className="m-auto rounded mb-4 w-full max-w-36 max-h-64 object-cover"
            />
          )}

          <h4 className="font-semibold mb-2 flex justify-end">
            {comments.length} / {total} bình luận
          </h4>

          {comments.length > 0 ? (
            comments.map((c) => (
              <div key={c.id} className=" py-2 flex items-start gap-2">
                {c.user?.avatar ? (
                  <img
                    src={`http://blogsystem.test/storage/${c.user.avatar}`}
                    alt="avatar"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-xs text-white">
                      {c.user?.email?.[0]?.toUpperCase()}
                    </span>
                  </div>
                //   <img
                //     src={`http://blogsystem.test/storage/avatar/default.jpg`}
                //     alt="avatar"
                //     className="w-8 h-8 rounded-full object-cover"
                //   />
                )}
                <div className="flex-1">
                  <p className="font-semibold">{c.user?.email}</p>
                  <p className="text-sm text-gray-600">{c.content}</p>
                </div>
                {(currentUser?.id === c.user_id || currentUser?.id === post.user_id) && (
                  <button
                    className="text-red-500 hover:text-red-700 pt-2"
                    onClick={() => deleteComment(c.id)}
                  >
                    <FaRegTrashCan size={18} />
                  </button>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500">Chưa có bình luận</p>
          )}

          {page <= lastPage && comments.length < total && (
            <button
              onClick={loadMoreComments}
              disabled={loadingMore}
              className="text-blue-500 hover:underline mt-2"
            >
              {loadingMore ? "Đang tải..." : "Xem thêm bình luận"}
            </button>
          )}
        </div>

        {/* Nhập comment */}
        <div className="border-t p-2 flex items-center relative">
          <input
            className="flex-1 border rounded-full px-4 py-2 pr-10"
            placeholder="Viết bình luận..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitComment()}
          />
          <button
            onClick={submitComment}
            className="absolute right-4 text-blue-500"
          >
            <FaRegPaperPlane size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewPostModal;
