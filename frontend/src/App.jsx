// App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DarkForm from "./DarkForm";
import ResultsPage from "./ResultPage";
import "./App.css"; // Tailwind CSS

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<DarkForm />} />
          <Route path="/results" element={<ResultsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
