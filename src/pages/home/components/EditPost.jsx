import React, { useState, useEffect } from "react";
import { FaRegCircleXmark } from "react-icons/fa6";

const API_BASE = "http://blogsystem.test/api";

const EditPost = ({ post, onClose, onUpdated }) => {
  const token = localStorage.getItem("authToken");
  const [initialFormData, setInitialFormData] = useState(null); // Lưu data ban đầu để reset
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image: null,
    category: null,
    tags: []
  });
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [searchTag, setSearchTag] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [preview, setPreview] = useState(null);

  // Init formData từ post và lưu initial
  useEffect(() => {
    if (post) {
      const initData = {
        title: post.title || "",
        content: post.content || "",
        image: null, // Không init file cũ, chỉ preview
        category: post.category ? { id: post.category.id, name: post.category.name } : null,
        tags: post.tags ? post.tags.map(t => ({ id: t.id, tag: t.tag })) : []
      };
      setFormData(initData);
      setInitialFormData(initData);
      setPreview(post.image ? `http://blogsystem.test/storage/${post.image}` : null);
    }
  }, [post]);

  // --- Lấy categories theo search ---
  useEffect(() => {
    if (searchCategory.length > 0 && token) {
      fetch(`${API_BASE}/categories?search=${searchCategory}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setCategories(data.data || data))
        .catch(err => console.error(err));
    } else {
      setCategories([]);
    }
  }, [searchCategory, token]);

  // --- Lấy tags theo search ---
  useEffect(() => {
    if (searchTag.length > 0 && token) {
      fetch(`${API_BASE}/tags?search=${searchTag}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setTags(data.data || data))
        .catch(err => console.error(err));
    } else {
      setTags([]);
    }
  }, [searchTag, token]);

  // --- Xử lý file ảnh mới ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  // --- Thêm tag ---
  const handleAddTag = (tag) => {
    if (!formData.tags.find(t => t.tag === tag.tag)) {
      setFormData({ ...formData, tags: [...formData.tags, { id: tag.id, tag: tag.tag }] });
    }
    setSearchTag("");
  };

  // --- Xóa tag ---
  const handleRemoveTag = (idOrName) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t.id !== idOrName && t.tag !== idOrName)
    });
  };

  // --- Thêm category ---
  const handleAddCategory = (cat) => {
    setFormData({ ...formData, category: { id: cat.id, name: cat.name } });
    setSearchCategory("");
  };

  // --- Xóa category ---
  const handleRemoveCategory = () => {
    setFormData({ ...formData, category: null });
  };

  // --- Tạo mới tag (local) ---
  const handleCreateTag = () => {
    if (searchTag && !formData.tags.find(t => t.tag === searchTag)) {
      setFormData({ ...formData, tags: [...formData.tags, { tag: searchTag }] });
    }
    setSearchTag("");
  };

  // --- Tạo mới category (POST) ---
  const handleCreateCategory = async () => {
    if (!token) return alert("Chưa đăng nhập!");
    try {
      const res = await fetch(`${API_BASE}/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: searchCategory })
      });
      if (!res.ok) throw new Error("Không tạo được category");
      const newCat = await res.json();
      setFormData({ ...formData, category: { id: newCat.id, name: newCat.name } });
      setSearchCategory("");
      setCategories([]);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tạo category");
    }
  };

  // --- Submit update (PUT với _method cho FormData) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return alert("Chưa đăng nhập!");

    const data = new FormData();
    data.append("title", formData.title);
    data.append("content", formData.content);
    if (formData.image instanceof File) data.append("image", formData.image);
    if (formData.category) data.append("category_id", formData.category.id);
    formData.tags.forEach((tag, i) => {
      data.append(`tags[${i}]`, tag.tag);
    });
    data.append("_method", "PUT"); // Hack cho Laravel PUT FormData

    try {
      const res = await fetch(`${API_BASE}/posts/${post.id}`, {
        method: "POST", // Vì FormData không hỗ trợ PUT trực tiếp
        headers: { Authorization: `Bearer ${token}` },
        body: data
      });
      if (!res.ok) throw new Error("Có lỗi khi cập nhật");
      const result = await res.json();
      alert("Cập nhật thành công!");
      onUpdated(result);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Lỗi khi cập nhật bài viết");
    }
  };

  // --- Reset form về dữ liệu ban đầu ---
  const handleReset = () => {
    if (initialFormData) {
      setFormData(initialFormData);
      setPreview(post.image ? `http://blogsystem.test/storage/${post.image}` : null);
    }
  };

  if (!post) return null;

  // Disable scroll outside
    useEffect(() => {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = "auto"; };
    }, []);
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
      onClick={onClose} 
    > 
      <div
        className="bg-white pb-6 px-6 rounded-lg w-[600px] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} // chặn click bên trong modal
      >
        {/* Header */}
        <div className="sticky top-0 pt-6 flex items-center justify-between pb-4 rounded-t-lg bg-white">
          <h3 className="text-lg font-semibold text-gray-900">
            Chỉnh sửa bài viết
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <FaRegCircleXmark size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tiêu đề */}
          <div>
            <label className="block mb-1">Tiêu đề</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          {/* Nội dung */}
          <div>
            <label className="block mb-1">Nội dung</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full border p-2 rounded"
              rows="4"
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
              + Chọn ảnh mới
            </label>
            {preview && (
              <div className="mt-2">
                <img src={preview} alt="preview" className="w-72 h-72 object-cover rounded" />
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
              {formData.tags.map((t, index) => (
                <span
                  key={t.id ?? index}
                  className="relative items-center px-2 py-1 bg-green-100 text-green-700 rounded "
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

          <div className="flex justify-end space-x-2">
            <button type="button" onClick={handleReset} className="px-4 py-2 bg-yellow-500 text-white rounded">
              Reset
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
              Hủy
            </button>
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPost;