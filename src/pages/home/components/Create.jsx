import React, { useState } from 'react';
import CreatePost from './CreatePost';

const Create = () => {
  const [showCreatePost, setShowCreatePost] = useState(false);

  return (
    <div className="mb-6">
      <button
        onClick={() => setShowCreatePost(true)}
        className="fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg z-40 flex items-center justify-center pt-[10px] w-16 h-16 text-4xl"
        title="Tạo bài viết mới"
      >
        +
      </button>
      
      {showCreatePost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Tạo bài viết mới</h2>
              <button
                onClick={() => setShowCreatePost(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <CreatePost onSuccess={() => setShowCreatePost(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Create;