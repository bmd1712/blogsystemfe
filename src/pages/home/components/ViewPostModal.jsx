// File: ViewPostModal.jsx (components/ViewPostModal.jsx)
import React from "react";

const ViewPostModal = ({ post, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center overflow-y-auto z-50">
      <div className="bg-white p-6 rounded-lg w-[600px] max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold mb-4">{post.title}</h3>
        {post.image && (
          <img
            src={`http://blogsystem.test/storage/${post.image}`}
            alt={post.title}
            className="rounded mb-4 w-full max-h-64 object-cover"
          />
        )}
        <p className="mb-4">{post.content}</p>

        <h4 className="font-semibold mb-2">Bình luận</h4>
        {post.comments?.length > 0 ? (
          post.comments.map((c) => (
            <div key={c.id} className="border-b py-2">
              <p className="font-semibold">{c.user?.name}</p>
              <p className="text-sm text-gray-600">{c.content}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">Chưa có bình luận</p>
        )}

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