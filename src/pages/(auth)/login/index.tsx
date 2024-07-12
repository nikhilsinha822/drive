import { Link } from "react-router-dom";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const Login = () => {
  const [user, setUser] = useState({
    username: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setError(null);
    setUser({
      ...user,
      [name]: value,
    });
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      setIsLoading(true);
      await axios.post(`${import.meta.env.VITE_BASE_URL}/auth/login`, {
        username: user.username,
        password: user.password
      });
      setUser({
        username: "",
        password: ""
      });
      navigate('/');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || 'An error occurred during login';
        setError(message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-4/5 md:w-2/5 mx-auto mt-10 bg-white p-8 border border-gray-300 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Enter your username"
              onChange={handleChange}
              value={user.username}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Enter your password"
              onChange={handleChange}
              value={user.password}
              required
            />
          </div>
          {
            error && <div className="bg-red-100 border text-sm flex gap-1 border-red-400 text-red-700 px-4 py-3 my-3 rounded relative" role="alert">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          }
          <button
            disabled={isLoading}
            type="submit" className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:shadow-outline hover:cursor-pointer disabled:cursor-not-allowed disabled:bg-blue-300">
            Login
          </button>
          <h3 className="text-sm p-5">Don't have an account? <Link className="text-blue-600 hover:text-blue-900" to='/register'>Register</Link></h3>
        </form>
      </div>
    </div>
  )
}

export default Login;
