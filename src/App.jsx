import React from "react";
import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/auth/components/Login.jsx";
import Register from "./pages/auth/components/Register.jsx";
import Home from "./pages/home/Home.jsx";
import NewsFeed from "./pages/home/components/NewsFeed.jsx";

import ProtectedRoute from "./shared/ProtectedRoute.jsx";
import Navbar from "./shared/Navbar.jsx";
import Footer from "./shared/Footer.jsx";

function App() {
  return (
    <Router>
      <Navbar />
      <div className="min-h-screen">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/newsfeed"
            element={
              <ProtectedRoute>
                <NewsFeed />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default App;
