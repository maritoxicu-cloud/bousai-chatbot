import React from 'react';
import ChatBot from './ChatBot';
import './App.css';
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <div className="App">
      <ChatBot />
      <Analytics />
    </div>
  );
}

export default App;
