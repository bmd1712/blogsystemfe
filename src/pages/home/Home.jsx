import React from "react";
import Create from "./components/Create";
import CreatePost from "./components/CreatePost";
import EditPost from "./components/EditPost";
import UserPosts from "./components/UserPosts";

const Home = () => {
  return (
    <div className="p-6">
        <h1 className="text-3xl font-bold">Trang cá nhân của bạn</h1>
        {/* <p className="mt-4">Chỉ thấy được nếu bạn đã đăng nhập.</p> */}
        <Create/>
        <CreatePost/>
        <EditPost/>
        <UserPosts/>
    </div>
  );
};

export default Home;
