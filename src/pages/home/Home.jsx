import React from "react";
import Create from "./components/Create";
import UserPosts from "./components/UserPosts";
import UserPosts1 from "./components/UserPosts1";

const Home = () => {
  return (
    <div className="p-6">
        <h1 className="text-3xl font-bold">Trang cá nhân của bạn</h1>
        <Create/>
        <UserPosts1/>
    </div>
  );
};

export default Home;
