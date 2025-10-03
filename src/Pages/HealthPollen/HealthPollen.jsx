import React from 'react';

function HealthPollen() {
  return (
    <div style={{ height: "calc(100vh - 64px)", width: "100%", marginTop: "64px" }}>
      <iframe
        src="http://localhost:3002/ai"
        style={{ width: "100%", height: "100%", border: "none" }}
        title="AI Portal"
      />
    </div>
  );
}

export default HealthPollen;
