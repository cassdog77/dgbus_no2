import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BusStopApp from './BusStopApp';
import BusStopDetails from './BusStopDetails';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BusStopApp />} /> {/* 기본 페이지 */}
        <Route path="/:stopName" element={<BusStopDetails />} /> {/* 특정 정류장 페이지 */}
      </Routes>
    </Router>
  );
}

export default App;