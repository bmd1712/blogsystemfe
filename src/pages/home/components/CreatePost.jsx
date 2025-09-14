import React, { useState, useEffect } from "react";

const CreatePost = ({onSuccess}) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image: null,
    category: null,   // Lưu object {id, name}
    tags: []          // Mảng object {id?, tag}
  });

  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [searchTag, setSearchTag] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [preview, setPreview] = useState(null);

  // --- Lấy categories theo search (fix URL với backtick và thêm token nếu cần) ---
  useEffect(() => {
    if (searchCategory.length > 0) {
      const token = localStorage.getItem("authToken");
      fetch(`http://blogsystem.test/api/categories?search=${searchCategory}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => res.json())
        .then((data) => setCategories(data.data || data));
    } else {
      setCategories([]);
    }
  }, [searchCategory]);

  // --- Lấy tags theo search (fix tương tự) ---
  useEffect(() => {
    if (searchTag.length > 0) {
      const token = localStorage.getItem("authToken");
      fetch(`http://blogsystem.test/api/tags?search=${searchTag}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => res.json())
        .then((data) => setTags(data.data || data));
    } else {
      setTags([]);
    }
  }, [searchTag]);

  // --- Xử lý file ảnh ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  // --- Thêm tag có sẵn ---
  const handleAddTag = (tag) => {
    if (!formData.tags.find((t) => t.tag === tag.tag)) {
      // Lưu {id, tag}
      setFormData({ ...formData, tags: [...formData.tags, { id: tag.id, tag: tag.tag }] });
    }
    setSearchTag("");
  };

  // --- Xóa tag ---
  const handleRemoveTag = (idOrName) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t.id !== idOrName && t.tag !== idOrName),
    });
  };

  // --- Thêm category có sẵn ---
  const handleAddCategory = (cat) => {
    setFormData({ ...formData, category: { id: cat.id, name: cat.name } });
    setSearchCategory("");
  };

  // --- Xóa category ---
  const handleRemoveCategory = () => {
    setFormData({ ...formData, category: null });
  };

  // --- Tạo mới tag (local, chỉ lưu tên) ---
  const handleCreateTag = () => {
    if (searchTag && !formData.tags.find((t) => t.tag === searchTag)) {
      setFormData({ ...formData, tags: [...formData.tags, { tag: searchTag }] });
    }
    setSearchTag("");
  };

  // --- Tạo mới category (lưu thật vào DB) ---
  const handleCreateCategory = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return alert("Chưa đăng nhập!");
    try {
      const res = await fetch("http://blogsystem.test/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: searchCategory }),
      });

      if (!res.ok) throw new Error("Không tạo được category");
      const newCat = await res.json();

      setFormData({ ...formData, category: { id: newCat.id, name: newCat.name } });
      setSearchCategory("");
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tạo category");
    }
  };

  // --- Submit form ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("title", formData.title);
    data.append("content", formData.content);
    if (formData.image) data.append("image", formData.image);
    if (formData.category) data.append("category_id", formData.category.id);
    formData.tags.forEach((tag, i) => {
      data.append(`tags[${i}]`, tag.tag);
    });

    const token = localStorage.getItem("authToken");
    if (!token) return alert("Chưa đăng nhập!");

    try {
      const res = await fetch("http://blogsystem.test/api/posts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      if (!res.ok) throw new Error("Có lỗi xảy ra");
      const result = await res.json();
      //console.log("API Response after create:", result);
      alert("Thêm thành công!");

      // Lấy currentUser từ localStorage (đã lưu trong PostList.jsx)
      const storedUser = JSON.parse(localStorage.getItem("currentUser")) || {};
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const tempPost = {
        tempId,
        user_id: storedUser.id || 1, // Fallback nếu không có
        title: formData.title,
        content: formData.content,
        image: formData.image ? URL.createObjectURL(formData.image) : null,
        category: formData.category,
        tags: formData.tags,
        likes_count: 0,
        comments_count: 0,
        is_liked: false,
        user: {
          avatar: storedUser.avatar || "avatar/default.jpg", // Fallback avatar
          email: storedUser.email || "unknown@example.com", // Fallback email
          name: storedUser.name || "Unknown User" // Fallback name
        },
        created_at: new Date().toISOString() // Thêm thời gian tạo tạm
      };

      // Lưu vào localStorage
      localStorage.setItem("tempPost", JSON.stringify(tempPost));

      // Reset form
      setFormData({ title: "", content: "", image: null, category: null, tags: [] });
      setPreview(null);

      // Gọi onSuccess để đóng modal
      if (onSuccess) onSuccess();

      // Dispatch custom event với tempPost
      window.dispatchEvent(new CustomEvent('postCreated', { detail: tempPost }));
    } catch (err) {
      console.error(err);
      alert("Lỗi khi thêm bài viết");
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Thêm Bài Viết</h2>
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Tiêu đề */}
        <div>
          <label className="block mb-1">Tiêu đề</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full border p-2 rounded"
            required
          />
        </div>

        {/* Nội dung */}
        <div>
          <label className="block mb-1">Nội dung</label>
          <textarea
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
            className="w-full border p-2 rounded"
            rows="4" // Thêm rows để giống edit
            required
          />
        </div>

        {/* Ảnh */}
        <div>
          <label className="block mb-1">Ảnh</label>
          <input
            type="file"
            id="image-upload"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          <label
            htmlFor="image-upload"
            className="inline-block px-3 py-1 bg-blue-500 text-white rounded cursor-pointer"
          >
            + Chọn ảnh
          </label>
          {preview && (
            <div className="mt-2">
              <img
                src={preview}
                alt="preview"
                className="w-72 h-72 object-cover rounded"
              />
            </div>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block mb-1">Category</label>
          <input
            type="text"
            value={searchCategory}
            onChange={(e) => setSearchCategory(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="Nhập category..."
          />
          {categories.length > 0 && (
            <div className="border p-2 mt-2 bg-gray-50 rounded">
              {categories.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  className="px-2 py-1 bg-blue-100 text-blue-700 rounded mr-2 mb-2"
                  onClick={() => handleAddCategory(c)}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
          {searchCategory && categories.length === 0 && (
            <button
              type="button"
              onClick={handleCreateCategory}
              className="mt-2 px-3 py-1 bg-green-500 text-white rounded"
            >
              Tạo mới "{searchCategory}"
            </button>
          )}
          {formData.category && (
            <div className="mt-2 flex items-center space-x-2">
              <span className="relative px-2 py-1 bg-green-100 text-green-700 rounded inline-block">
                {formData.category.name}
                <button
                  type="button"
                  onClick={handleRemoveCategory}
                  className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 ml-2 text-red-500 font-bold"
                >
                  ×
                </button>
              </span>
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block mb-1">Tags</label>
          <input
            type="text"
            value={searchTag}
            onChange={(e) => setSearchTag(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="Nhập tag..."
          />
          {tags.length > 0 && (
            <div className="border p-2 mt-2 bg-gray-50 rounded">
              {tags.map((t) => (
                <button
                  type="button"
                  key={t.id}
                  className="px-2 py-1 bg-blue-100 text-blue-700 rounded mr-2 my-2"
                  onClick={() => handleAddTag(t)}
                >
                  {t.tag}
                </button>
              ))}
            </div>
          )}
          {searchTag && tags.length === 0 && (
            <button
              type="button"
              onClick={handleCreateTag}
              className="mt-2 px-3 py-1 bg-green-500 text-white rounded"
            >
              Tạo mới "{searchTag}"
            </button>
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.tags.map((t, index) => ( // Thêm index cho key an toàn
              <span
                key={t.id ?? index}
                className="relative flex items-center px-2 py-1 bg-green-100 text-green-700 rounded inline-block"
              >
                {t.tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(t.id ?? t.tag)}
                  className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 ml-2 text-red-500 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Thêm bài viết
        </button>
      </form>
    </div>
  );
};

export default CreatePost;