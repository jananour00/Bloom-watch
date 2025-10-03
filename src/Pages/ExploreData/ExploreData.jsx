import React from "react";

function ExploreData() {
  return (
    <div style={{ height: "calc(100vh - 64px)", width: "100%", marginTop: "64px" }}>
      <iframe
        src="http://localhost:3001"  /* Assuming main app runs on port 3001 */
        style={{ width: "100%", height: "100%", border: "none" }}
        title="Main Project"
      />
    </div>
  );
}

export default ExploreData;
