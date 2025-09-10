// File: DeleteConfirmModal.jsx (components/DeleteConfirmModal.jsx)
import React from "react";

const DeleteConfirmModal = ({ post, onClose, onConfirm }) => {
  const token = localStorage.getItem("authToken");

  const deletePost = async () => {
    try {
      const res = await fetch(`http://blogsystem.test/api/posts/${post.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Xóa thất bại");
      onConfirm(post.id);
    } catch (err) {
      console.error("Lỗi xóa:", err);
      alert("Không thể xóa bài viết");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-80">
        <h3 className="text-lg font-bold mb-4">Xóa bài viết?</h3>
        <p>Bạn có chắc chắn muốn xóa bài viết này?</p>
        <div className="flex justify-end mt-4 space-x-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
            Hủy
          </button>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded"
            onClick={deletePost}
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;