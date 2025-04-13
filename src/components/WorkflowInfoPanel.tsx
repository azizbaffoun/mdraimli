import React from 'react';

// Import Icon (Adjust path as needed)
import workflowIcon from '@/assets/icons/workflow.svg';

// Define props
interface WorkflowInfoPanelProps {
  isExiting?: boolean;
}

const WorkflowInfoPanel: React.FC<WorkflowInfoPanelProps> = ({ isExiting = false }) => {
  // Animation class
  const animationClass = isExiting ? 'panel-fade-out' : '';

  return (
    <div className={`absolute top-18 left-4 p-4 rounded-lg max-w-lg z-10 pointer-events-none ${animationClass}`}> {/* Apply animation class */}
      {/* First Line: Icon + Title */}
      <div className="flex items-center space-x-2 mb-2">
        <img src={workflowIcon} alt="Workflow Icon" className="h-5 w-5" /> {/* Slightly smaller icon */}
        <span className="text-md font-medium text-gray-700">Workflow</span> {/* Normal weight title */}
      </div>

      {/* Second Line: Description */}
      <p className="text-sm text-gray-500"> {/* Grey description text */}
        Start creating your workflow by clicking or dragging nodes from the toolbar.
      </p>
    </div>
  );
};

export default WorkflowInfoPanel;