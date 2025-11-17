// // src/components/Navbar.jsx
// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';

// const Navbar = () => {
//   const { user, isAuthenticated, logout } = useAuth();
//   const [showUserMenu, setShowUserMenu] = useState(false);
//   const navigate = useNavigate();

//   const handleLogout = async () => {
//     await logout();
//     navigate('/login');
//   };

//   return (
//     <nav className="bg-white shadow-lg fixed top-0 w-full z-50">
//       <div className="max-w-7xl mx-auto px-4">
//         <div className="flex justify-between items-center h-16">
//           {/* Logo */}
//           <Link to="/" className="flex items-center space-x-2">
//             <div className="bg-red-600 text-white px-2 py-1 rounded font-bold text-xl">
//               YT
//             </div>
//             <span className="font-semibold text-xl text-gray-800">
//               YouTube Clone
//             </span>
//           </Link>

//           {/* Search Bar */}
//           <div className="flex-1 max-w-2xl mx-8">
//             <div className="relative">
//               <input
//                 type="text"
//                 placeholder="Search videos..."
//                 className="w-full px-4 py-2 border border-gray-300 rounded-l-full focus:outline-none focus:border-blue-500"
//               />
//               <button className="absolute right-0 top-0 h-full px-6 bg-gray-100 border border-l-0 border-gray-300 rounded-r-full hover:bg-gray-200">
//                 <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                 </svg>
//               </button>
//             </div>
//           </div>

//           {/* User Menu */}
//           {isAuthenticated ? (
//             <div className="relative">
//               <button
//                 onClick={() => setShowUserMenu(!showUserMenu)}
//                 className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
//               >
//                 <img
//                   src={user?.avatar || '/default-avatar.png'}
//                   alt="Profile"
//                   className="w-8 h-8 rounded-full object-cover"
//                 />
//                 <span className="font-medium">{user?.username}</span>
//               </button>

//               {showUserMenu && (
//                 <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
//                   <Link
//                     to="/profile"
//                     className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                     onClick={() => setShowUserMenu(false)}
//                   >
//                     Profile
//                   </Link>
//                   <Link
//                     to="/upload"
//                     className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                     onClick={() => setShowUserMenu(false)}
//                   >
//                     Upload Video
//                   </Link>
//                   <button
//                     onClick={handleLogout}
//                     className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                   >
//                     Logout
//                   </button>
//                 </div>
//               )}
//             </div>
//           ) : (
//             <div className="flex space-x-4">
//               <Link
//                 to="/login"
//                 className="text-blue-600 hover:text-blue-800 font-medium"
//               >
//                 Login
//               </Link>
//               <Link
//                 to="/register"
//                 className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
//               >
//                 Sign Up
//               </Link>
//             </div>
//           )}
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;
// src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { searchAPI } from '../api';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Debounced search suggestions
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        const response = await searchAPI.getSuggestions(searchQuery);
        setSuggestions(response.data.data || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.type === 'video') {
      navigate(`/video/${suggestion.id}`);
    } else if (suggestion.type === 'channel') {
      navigate(`/channel/${suggestion.username}`);
    }
    setSearchQuery('');
    setShowSuggestions(false);
  };

//   return (
//     <nav className="bg-white shadow-lg fixed top-0 w-full z-50">
//       <div className="max-w-7xl mx-auto px-4">
//         <div className="flex justify-between items-center h-16">
//           {/* Logo */}
//           <Link to="/" className="flex items-center space-x-2">
//             <div className="bg-red-600 text-white px-2 py-1 rounded font-bold text-xl">
//               YT
//             </div>
//             <span className="font-semibold text-xl text-gray-800">
//               YouTube Clone
//             </span>
//           </Link>

//           {/* Search Bar */}
//           <div className="flex-1 max-w-2xl mx-8">
//             <div className="relative">
//               <input
//                 type="text"
//                 placeholder="Search videos..."
//                 className="w-full px-4 py-2 border border-gray-300 rounded-l-full focus:outline-none focus:border-blue-500"
//               />
//               <button className="absolute right-0 top-0 h-full px-6 bg-gray-100 border border-l-0 border-gray-300 rounded-r-full hover:bg-gray-200">
//                 <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                 </svg>
//               </button>
//             </div>
//           </div>

//           {/* User Menu */}
//           {isAuthenticated ? (
//             <div className="relative">
//               <button
//                 onClick={() => setShowUserMenu(!showUserMenu)}
//                 className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
//               >
//                 <img
//                   src={user?.avatar || '/default-avatar.png'}
//                   alt="Profile"
//                   className="w-8 h-8 rounded-full object-cover"
//                 />
//                 <span className="font-medium">{user?.username}</span>
//               </button>

//               {showUserMenu && (
//                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
//                {/* <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10"> */}
//                   <Link
//                     to="/profile"
//                     className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                     onClick={() => setShowUserMenu(false)}
//                   >
//                     Profile
//                   </Link>
//                   <Link
//                     to="/upload"
//                     className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                     onClick={() => setShowUserMenu(false)}
//                   >
//                     Upload Video
//                   </Link>
//                   <button
//                     onClick={handleLogout}
//                     className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                   >
//                     Logout
//                   </button>
//                 </div>
//               )}
//             </div>
//           ) : (
//             <div className="flex space-x-4">
//               <Link
//                 to="/login"
//                 className="text-blue-600 hover:text-blue-800 font-medium"
//               >
//                 Login
//               </Link>
//               <Link
//                 to="/register"
//                 className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
//               >
//                 Sign Up
//               </Link>
//             </div>
//           )}
//         </div>
//       </div>
//     </nav>
//   );
// return (
//     <nav className="navbar">
//       <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%'}}>
//         {/* Logo */}
//         <div style={{display: 'flex', alignItems: 'center'}}>
//           <span style={{background: '#ff0000', color: 'white', padding: '5px 10px', borderRadius: '4px', marginRight: '10px'}}>YT</span>
//           <span style={{fontSize: '18px', fontWeight: 'bold'}}>YouTube Clone</span>
//         </div>
  
//         {/* User menu */}
//         {isAuthenticated ? (
//           <div style={{display: 'flex', alignItems: 'center'}}>
//             <img src={user?.avatar || '/default-avatar.png'} alt="Profile" style={{width: '35px', height: '35px', borderRadius: '50%', marginRight: '10px'}} />
//             <span>{user?.username}</span>
//           </div>
//         ) : (
//           <div>
//             <a href="/login" className="btn btn-primary">Login</a>
//           </div>
//         )}
//       </div>
//     </nav>
//   );
return (
    <nav className="navbar">
      <div className="navbar-content">
        <a href="/" className="navbar-logo">
          <span className="navbar-logo-icon">VF</span>
          <span className="navbar-logo-text">VidFlow</span>
        </a>

        <div className="navbar-search" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="flex w-full">
            <input 
              type="text" 
              placeholder="Search videos..." 
              className="navbar-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (suggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
            />
            <button type="submit" className="navbar-search-btn">
              🔍
            </button>
          </form>
          
          {/* Search Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="search-suggestions">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="search-suggestion-item"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion.type === 'video' ? (
                    <>
                      <span className="search-suggestion-icon">📹</span>
                      <div className="search-suggestion-info">
                        <div className="search-suggestion-title">{suggestion.display}</div>
                        <div className="search-suggestion-type">Video</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <img 
                        src={suggestion.avatar || '/default-avatar.png'} 
                        alt={suggestion.username}
                        className="search-suggestion-avatar"
                      />
                      <div className="search-suggestion-info">
                        <div className="search-suggestion-title">{suggestion.display}</div>
                        <div className="search-suggestion-type">Channel</div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {isAuthenticated ? (
          <div className="navbar-user">
            <img 
              src={user?.avatar || '/default-avatar.png'} 
              alt="Profile" 
              className="navbar-user-avatar"
              onClick={() => setShowUserMenu(!showUserMenu)}
            />
            <span className="navbar-user-name">{user?.username}</span>
            
            {showUserMenu && (
              <div className="navbar-dropdown">
                <a href="/profile" className="navbar-dropdown-item">Profile</a>
                <a href="/upload" className="navbar-dropdown-item">Upload Video</a>
                <button onClick={handleLogout} className="navbar-dropdown-item">Logout</button>
              </div>
            )}
          </div>
        ) : (
          <div>
            <a href="/login" className="btn btn-primary">Sign In</a>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;