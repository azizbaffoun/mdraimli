// import React from 'react'; // Revert import
import WorkflowEditor from '@/components/WorkflowEditor'; // Use alias
import Navbar from '@/components/Navbar'; // Import the Navbar
// Remove unused imports
// import ItemsBar from '@/components/ItemsBar'; 
// import { ContentType } from '@/components/WorkflowEditor';

function App() {
  // Remove ref and handlers
  // const workflowEditorRef = useRef<WorkflowEditorRef>(null);
  // const handleSaveWorkflow = () => { ... };
  // const handleAddNote = () => { ... };
  // const handleOrganizeLayout = () => { ... };
  // const handleUndo = () => { ... };
  // const handleDummyIconClick = (...) => { ... };

  return (
    <div className="w-screen h-screen flex flex-col relative"> {/* Add relative positioning */}
      <Navbar /> {/* Render Navbar at the top */}
      
      {/* Main content area taking remaining space */} 
      <div className="flex-grow relative overflow-hidden"> {/* Updated classes */}
         {/* Remove ref */}
         <WorkflowEditor /> 
      </div>

      {/* Remove ItemsBar from here */}
      {/* <ItemsBar ... /> */}
    </div>
  );
}

export default App; 