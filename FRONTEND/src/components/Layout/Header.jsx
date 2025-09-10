import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const Header = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <header style={{ padding: "1rem", borderBottom: "1px solid #ccc" }}>
      <nav>
        <Link to="/" style={{ marginRight: "1rem" }}>
          Home
        </Link>

        {user ? (
          <>
            <span>Welcome, {user.fullname || user.username}</span>
            <button onClick={logout} style={{ marginLeft: "1rem" }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ marginRight: "1rem" }}>
              Login
            </Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
