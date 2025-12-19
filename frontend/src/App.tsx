import { BrowserRouter, Route, Routes } from "react-router-dom";
import Allanalysis from "./pages/Allanalysis";
import Analysis from "./pages/Analysis";
import HomePage from "./pages/HomePage";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/analysis" element={<Allanalysis />} />
        <Route path="/analysis/:id" element={<Analysis />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
