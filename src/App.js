import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Upload from './Upload';
import UploadList from './UploadList';


function App() {
  return (
    <Router>
      <Routes>
    
        <Route exact path="/" element={<Upload />} />
        <Route path="/upload-list" element={<UploadList />} />
      </Routes>
    </Router>
  );
}

export default App;
