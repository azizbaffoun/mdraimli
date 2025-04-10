// import React from 'react';
import WorkflowEditor from '@/components/WorkflowEditor'; // Use alias
import Navbar from '@/components/Navbar'; // Import the Navbar

function App() {
  return (
    <div className="w-screen h-screen flex flex-col relative"> {/* Add relative positioning */}
      <Navbar /> {/* Render Navbar at the top */}
      
      {/* Main content area taking remaining space */} 
      <div className="flex-grow relative overflow-hidden"> {/* Updated classes */}
         <WorkflowEditor />
      </div>
    </div>
  );
}

export default App; 