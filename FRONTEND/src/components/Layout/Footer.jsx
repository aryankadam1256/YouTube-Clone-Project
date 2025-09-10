import React from "react";

const Footer = () => {
  return (
    <footer
      style={{
        marginTop: "2rem",
        padding: "1rem",
        borderTop: "1px solid #ccc",
        textAlign: "center",
        color: "#777",
      }}
    >
      <p>© {new Date().getFullYear()} Your Video Hosting App</p>
    </footer>
  );
};

export default Footer;
