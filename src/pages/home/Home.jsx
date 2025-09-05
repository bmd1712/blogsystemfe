import React from "react";
import CreatePost from "./components/CreatePost";
import EditPost from "./components/EditPost";
const Home = () => {
  return (
    <div className="p-6">
        <h1 className="text-3xl font-bold">Trang cá nhân của bạn</h1>
        <p className="mt-4">Chỉ thấy được nếu bạn đã đăng nhập.</p>
        <CreatePost/>
        <EditPost/>
    </div>
  );
};

export default Home;
