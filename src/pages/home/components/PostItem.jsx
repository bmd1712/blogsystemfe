import React, { useState, useEffect } from "react";
import EditPost from "./EditPost";
import DeleteConfirmModal from "./DeleteConfirmModal";
import ViewPostModal from "./ViewPostModal";
import { FaPenToSquare, FaRegTrashCan } from "react-icons/fa6";
import { FaRegComment } from "react-icons/fa";
import { BiLike } from "react-icons/bi";

const API_BASE = "http://blogsystem.test/api";
const STORAGE_BASE = "http://blogsystem.test/storage";

const PostItem = ({ post, currentUser }) => {
  const [editingPost, setEditingPost] = useState(null);
  const [deletingPost, setDeletingPost] = useState(null);
  const [viewingPost, setViewingPost] = useState(null);

  // Like state
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [liked, setLiked] = useState(post.is_liked || false);

  // Comment count state (đồng bộ với ViewPostModal)
  const [commentsCount, setCommentsCount] = useState(post.comments_count);

  const token = localStorage.getItem("authToken");
  const isOwner = currentUser?.id === post.user_id;

  // Lấy tổng like ban đầu
  // useEffect(() => {
  //   const fetchLikes = async () => {
  //     try {
  //       const res = await fetch(`${API_BASE}/posts/${post.id}/likes`, {
  //         headers: { Authorization: `Bearer ${token}` },
  //       });
  //       if (!res.ok) throw new Error("Không thể tải like count");
  //       const data = await res.json();
  //       setLikesCount(data.likes || 0);
  //     } catch (err) {
  //       console.error(err);
  //     }
  //   };
  //   fetchLikes();
  // }, [post.id, token]);

  // Toggle like
  const handleLike = async () => {
    // cập nhật UI ngay lập tức
    if (liked) {
      setLikesCount(likesCount - 1);
      setLiked(false);
    } else {
      setLikesCount(likesCount + 1);
      setLiked(true);
    }

    try {
      await fetch(`${API_BASE}/posts/${post.id}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      
    } catch (err) {
      console.error(err);
      // rollback nếu lỗi
      setLikesCount(liked ? likesCount + 1 : likesCount - 1);
      setLiked(liked);
    }
  };

    // Hàm format thời gian
    const formatPostDate = (dateString) => {
      if (!dateString) return "";

      const date = new Date(dateString);
      const now = new Date();

      const diffMs = now - date; // mili giây
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

      if (diffHours < 24) {
        if (diffHours < 1) {
          const diffMinutes = Math.floor(diffMs / (1000 * 60));
          return diffMinutes <= 1
            ? "Vừa xong"
            : ` ${diffMinutes} phút trước`;
        }
        return `${diffHours} giờ trước`;
      }

      // Nếu quá 24h thì hiển thị dd/mm/yyyy HH:mm
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();

      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");

      return ` ${hours}:${minutes} ${day}/${month}/${year}`;
    };  

  return (
    <div className="bg-white shadow-md shadow-blue-300 rounded-lg p-4 mb-4 max-w-[350px] sm:max-w-[800px]">
      {/* Header user info */}
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-2">
          <img
            src={`${STORAGE_BASE}/${post.user?.avatar || "avatar/default.jpg"}`}
            alt="avatar"
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="font-semibold">{post.user?.email}</p>
            <div className="">
              <p className="text-gray-500 text-sm ">
                {post.category?.name || ""}
              </p>
              <p className="text-gray-500 text-sm "> 
                {formatPostDate(post.created_at)}
              </p>
            </div>
          </div>
        </div>

        {/* Menu 3 chấm */}
        {isOwner && (
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
              className="w-35 hidden absolute right-0 mt-2 bg-white rounded shadow-lg "
            >
              <button
                className="flex px-4 py-2 hover:bg-gray-100 w-full text-left"
                onClick={() => setEditingPost(post)}
              >
                <FaPenToSquare className="mt-1 mr-3"/> Chỉnh sửa
              </button>
              <button
                className="flex px-4 py-2 hover:bg-gray-100 w-full text-left"
                onClick={() => setDeletingPost(post)}
              >
                <FaRegTrashCan className="mt-1 mr-3"/> Xóa
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
        <p>{post.content}</p>
      {/* Image */}
      <div className="grid justify-center ">
        {post.image && (
          <img
            src={`${STORAGE_BASE}/${post.image}`}
            alt={post.title}
            className="rounded-md my-3 object-cover"
          />
        )}
      </div>
      {/* Actions */}
      <div className="flex space-x-4 mt-3 text-gray-600">
        <button
          onClick={handleLike}
          className={`flex hover:text-blue-500 ${liked ? "text-blue-600 font-bold" : ""}`}
        >
          <BiLike className="mt-1 mr-2"/> Thích {likesCount}
        </button>
        <button
          className="flex hover:text-blue-500"
          onClick={() => setViewingPost(post)}
        >
          <FaRegComment className="mt-1 mr-2"/> Bình luận {commentsCount}
        </button>
      </div>

      {/* Modal sửa */}
      {editingPost && (
        <EditPost
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onUpdated={() => window.location.reload()}
        />
      )}

      {/* Modal xóa */}
      {deletingPost && (
        <DeleteConfirmModal
          post={deletingPost}
          onClose={() => setDeletingPost(null)}
          onConfirm={() => window.location.reload()}
        />
      )}

      {/* Modal chi tiết + comments */}
      {viewingPost && (
        <ViewPostModal
          post={viewingPost}
          onClose={() => setViewingPost(null)}
          // callback để cập nhật lại commentsCount
          onCommentCountChange={(newCount) => setCommentsCount(newCount)}
        />
      )}
    </div>
  );
};

export default PostItem;
