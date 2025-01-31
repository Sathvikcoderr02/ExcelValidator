import { Link } from 'react-router-dom';

function Navbar({ token, onLogout }) {
  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-800">
              Excel Validator
            </Link>
          </div>
          <div className="flex items-center">
            {token ? (
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Logout
              </button>
            ) : (
              <div className="flex space-x-4">
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
