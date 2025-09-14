import React from 'react'
import PostList from '../../home/components/PostList'

const Posts = () => {
  return (
    <PostList
      apiUrl="http://blogsystem.test/api/posts"
      //title="Bảng tin"
    />
  )
}

export default Posts