import React from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  return (
    <div style={{ marginTop: "64px", height: "calc(100vh - 64px)", width: "100%" }}>
      <iframe
        src="http://localhost:3000"
        style={{ width: "100%", height: "100%", border: "none" }}
        title="Bloompage"
      />
    </div>
  );
}

export default Dashboard;
