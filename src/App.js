// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Routes 추가
import BusStopApp from './BusStopApp';

function App() {
  return (
    <Router>
      <Routes> {/* Routes로 Route를 감싸줌 */}
        <Route path="/:stopName?" element={<BusStopApp />} /> {/* component 대신 element 사용 */}
      </Routes>
    </Router>
  );
}

export default App;