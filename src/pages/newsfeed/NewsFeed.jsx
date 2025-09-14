import React from "react";
import Posts from "./components/Posts";
import Create from '../home/components/Create'

const NewsFeed = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Bảng tin</h1>
      <Create/>
      <Posts/>
    </div>
  );
};

export default NewsFeed;
