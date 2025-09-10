import React, { useState } from "react";
import EditPost from "./EditPost";
import DeleteConfirmModal from "./DeleteConfirmModal";
import ViewPostModal from "./ViewPostModal";

const API_BASE = "http://blogsystem.test/storage";

const PostItem = ({ post, currentUser }) => {
  const [editingPost, setEditingPost] = useState(null);
  const [deletingPost, setDeletingPost] = useState(null);
  const [viewingPost, setViewingPost] = useState(null);

  const isOwner = currentUser?.id === post.user_id;

  return (
    <div className="bg-white shadow-md shadow-blue-300 rounded-lg p-4 mb-4">
      {/* Header user info */}
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-2">
          <img
            src={`${API_BASE}/${post.user?.avatar || "avatar/default.jpg"}`}
            alt="avatar"
            className="w-10 h-10 rounded-full"
          />
          <div>
            {/* <p>{post.user?.avatar}</p> */}
            <p className="font-semibold">{post.user?.email}</p>
            <p className="text-gray-500 text-sm min-h-[20px]">{post.category?.name || ""}</p> 
            {/* \u00A0 ký tự khoảng trắng */}
          </div>
        </div>

        {/* Menu 3 chấm (chỉ hiện cho chủ bài viết) */}
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
        )}
      </div>

      {/* Image */}
      {post.image && (
        <img
          src={`${API_BASE}/${post.image}`}
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

      {/* Modal sửa */}
      {editingPost && (
        <EditPost
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onUpdated={(updated) =>
            window.location.reload() // hoặc cập nhật state ở PostList
          }
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
        <ViewPostModal post={viewingPost} onClose={() => setViewingPost(null)} />
      )}
    </div>
  );
};

export default PostItem;
