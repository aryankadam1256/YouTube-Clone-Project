// // src/components/Sidebar.jsx
// import React from 'react';
// import { Link, useLocation } from 'react-router-dom';

// const Sidebar = () => {
//   const location = useLocation();

//   const menuItems = [
//     { path: '/', name: 'Home', icon: '🏠' },
//     { path: '/upload', name: 'Upload', icon: '📤' },
//     { path: '/profile', name: 'Profile', icon: '👤' },
//   ];

//   return (
//     <div className="fixed left-0 top-16 w-64 h-full bg-white shadow-lg z-40">
//       <div className="p-4">
//         <nav className="space-y-2">
//           {menuItems.map((item) => (
//             <Link
//               key={item.path}
//               to={item.path}
//               className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
//                 location.pathname === item.path
//                   ? 'bg-red-100 text-red-600'
//                   : 'text-gray-700 hover:bg-gray-100'
//               }`}
//             >
//               <span className="text-xl">{item.icon}</span>
//               <span className="font-medium">{item.name}</span>
//             </Link>
//           ))}
//         </nav>
//       </div>
//     </div>
//   );
// };

// export default Sidebar;
// src/components/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/', name: 'Home', icon: '🏠' },
    { path: '/upload', name: 'Upload', icon: '📤' },
    { path: '/profile', name: 'Profile', icon: '👤' },
  ];

  return (
    <div className="fixed left-0 top-16 w-64 h-full bg-white shadow-lg z-40">
      <div className="p-4">
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-red-100 text-red-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;