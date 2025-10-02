import React from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <iframe
        src="http://localhost:3000"
        style={{ width: "100%", height: "100%", border: "none" }}
        title="Bloompage"
      />
      <button
        onClick={() => navigate("/")}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          zIndex: 1000,
        }}
      >
        Return
      </button>
    </div>
  );
}

export default Dashboard;
