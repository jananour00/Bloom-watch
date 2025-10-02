import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./Layout.jsx";
import Home from "./Pages/Home/Home.jsx";
import Dashboard from "./Pages/Dashboard/Dashboard.jsx";
import Data from "./Pages/Data/Data.jsx";
import ExploreData from "./Pages/ExploreData/ExploreData.jsx";
import Storytelling from "./Pages/Storytelling/Storytelling.jsx";
import HealthPollen from "./Pages/HealthPollen/HealthPollen.jsx";
import DesertRisk from "./Pages/DesertRisk/DesertRisk.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/Data" element={<Data />} />
          <Route path="/ExploreData" element={<ExploreData />} />
          <Route path="/Storytelling" element={<Storytelling />} />
          <Route path="/HealthPollen" element={<HealthPollen />} />
          <Route path="/DesertRisk" element={<DesertRisk />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
