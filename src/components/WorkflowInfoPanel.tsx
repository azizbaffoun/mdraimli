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
     

      {/* Second Line: Description */}
      
    </div>
  );
};

export default WorkflowInfoPanel;