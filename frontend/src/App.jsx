import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import FileUpload from './components/FileUpload';
import { useState } from 'react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  const handleLogin = (token) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <div className="min-h-screen w-full bg-white">
        {isAuthenticated && (
          <div className="w-full flex justify-end p-4">
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        )}
        <Routes>
          <Route
            path="/login"
            element={
              !isAuthenticated ? (
                <Login onLogin={handleLogin} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/register"
            element={
              !isAuthenticated ? (
                <Register onRegister={handleLogin} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <FileUpload />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
