import React from 'react'

const login = () => {
  return (
    <form className='flex flex-col justify-center items-center'>
        <span>Tài khoản</span>
        <input type="text" name="" id="" className='bg-amber-300'/>
        <span>Mật khẩu</span>
        <input type="text" name="" id="" className='bg-amber-300'/>
        <button type='submit' className='bg-blue-500 text-white px-4 py-2 mt-4 rounded cursor-pointer'>Gửi</button>
    </form>
  )
}

export default login