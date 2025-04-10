import React, { useState } from 'react';

// Import Icons
import workflowIcon from '@/assets/icons/workflow.svg'; // Revert to SVG
import { Pencil } from 'lucide-react'; // Add Pencil icon for editing

const Navbar: React.FC = () => {
  const [workflowName, setWorkflowName] = useState("My Workflow");
  const [isEditing, setIsEditing] = useState(false);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWorkflowName(event.target.value);
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    // Optionally: Add logic here to save the name (e.g., API call)
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      setIsEditing(false);
      // Optionally: Add logic here to save the name
    }
  };

  return (
    <nav className="bg-white shadow-md px-4 py-4 w-full"> {/* Increased py */}
      <div className="flex items-center">
        {/* Left Side */}
        <div className="flex items-center space-x-3 mr-4"> {/* Increased space */}
          <img src={workflowIcon} alt="Workflow Icon" className="h-7 w-7" /> {/* Reverted to SVG, adjusted size */}
          {isEditing ? (
            <input 
              type="text"
              value={workflowName}
              onChange={handleInputChange}
              onBlur={handleInputBlur} // Save on blur
              onKeyDown={handleInputKeyDown} // Save on Enter
              className="font-bold text-xl text-gray-800 border-b-2 border-blue-500 focus:outline-none bg-transparent"
              autoFocus // Focus the input when it appears
            />
          ) : (
            <span className="font-bold text-xl text-gray-800">{workflowName}</span> 
          )}
          {!isEditing && ( // Show button only when not editing
            <button
              onClick={handleEditClick}
              title="Edit workflow name"
              className="p-1 rounded hover:bg-gray-200"
            >
              <Pencil size={18} className="text-gray-600" />
            </button>
          )}
        </div>

        {/* Center/Right Side (can be added later if needed) */}
        {/* <div className="flex-grow"></div> */}
        {/* <div className="flex items-center space-x-4"> ... </div> */}

      </div>
    </nav>
  );
};

export default Navbar;