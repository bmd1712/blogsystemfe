    import React, { useEffect, useState, useCallback } from "react";
    import PostItem from "./PostItem";

    const API_BASE = "http://blogsystem.test/api";

    const PostList = ({ apiUrl, title }) => {
    const token = localStorage.getItem("authToken");
    const [currentUser, setCurrentUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

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
            localStorage.setItem("currentUser", JSON.stringify(data)); // Lưu currentUser
        } catch (err) {
            console.error("Lỗi lấy user:", err);
        }
        };
        if (token) fetchUser();
    }, [token]);

        // Lấy bài viết
        const fetchPosts = useCallback(async (pageNumber) => {
        if (loading || !hasMore || !apiUrl) return;

        setLoading(true);
        try {
            const res = await fetch(`${apiUrl}?page=${pageNumber}`, {
            headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Không thể tải posts");

            const data = await res.json();
            setPosts((prev) => [...prev, ...data.data]);
            setHasMore(data.next_page_url !== null);

            // tăng page sau khi gọi xong
            setPage(pageNumber + 1);
        } catch (err) {
            console.error("Lỗi lấy posts:", err);
        } finally {
            setLoading(false);
        }
        }, [loading, hasMore, token, apiUrl]);
        // Hàm debounce
        function debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                clearTimeout(timeout);
                func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }   
        // Reset khi đổi apiUrl
        useEffect(() => {
        if (apiUrl) {
            setPosts([]);
            setPage(1);
            setHasMore(true);
            fetchPosts(1); // load trang đầu
        }
        }, [apiUrl]);

        // 👉 Khi page thay đổi thì fetch
        // useEffect(() => {
        // if (apiUrl && page === 1) {
        //     fetchPosts(1); // load page đầu tiên
        // }
        // }, [apiUrl, page, fetchPosts]);

        // 👉 Scroll xuống cuối mới load tiếp
        useEffect(() => {
        const handleScroll = () => {
            if (
            window.innerHeight + window.scrollY >=
            document.body.offsetHeight - 200
            ) {
            if (!loading && hasMore) {
                fetchPosts(page);
            }
            }
        };

        const debouncedHandleScroll = debounce(handleScroll, 200);
        window.addEventListener("scroll", debouncedHandleScroll);
        return () => window.removeEventListener("scroll", debouncedHandleScroll);
        }, [page, hasMore, loading, fetchPosts]);

        // Lắng nghe custom event từ CreatePost để thêm post mới
        useEffect(() => {
            const handlePostCreated = (e) => {
            const newPost = e.detail;
            setPosts(prev => [newPost, ...prev]); // Thêm vào đầu list
            };
            window.addEventListener('postCreated', handlePostCreated);
            return () => window.removeEventListener('postCreated', handlePostCreated);
        }, []);

        if (!currentUser || !apiUrl) return <p>Đang tải...</p>;

        //lọc trùng trước khi render
        const uniquePosts = posts.filter(
            (post, index, self) => index === self.findIndex(p => p.id === post.id)
        );

    return (
        <div className="mt-6">
        {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}

        {uniquePosts.map((post) => (
            <PostItem   key={post.id || post.tempId || `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`}
                        post={post} 
                        currentUser={currentUser} />
        ))}

        {loading && <p>Đang tải thêm...</p>}
        {!hasMore && <p className="text-gray-500 text-center">Hết bài viết</p>}
        </div>
    );
    };

    export default PostList;
