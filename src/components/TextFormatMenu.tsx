import React from 'react';

// Import the extracted icons (add all needed imports here)

// ... import other icons

interface TextFormatMenuProps {
  onFormat: (command: string, value?: string) => void;
}

const TextFormatMenu: React.FC<TextFormatMenuProps> = ({ onFormat }) => {
  // Menu items array with their commands and icons
  const menuItems = [
    { command: 'bold', icon: '🅱️', label: 'Bold' },
    { command: 'italic', icon: '𝐼', label: 'Italic' },
    { command: 'underline', icon: '𝐔', label: 'Underline' },
    // Add more formatting options as needed
  ];

  return (
    <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#3799db] to-[#2db4a6] p-2 rounded-lg shadow-lg">
      {menuItems.map((item) => (
        <button
          key={item.command}
          onClick={() => onFormat(item.command)}
          className="w-8 h-8 flex items-center justify-center bg-white bg-opacity-20 hover:bg-opacity-30 rounded text-white transition-all duration-200"
          title={item.label}
        >
          {item.icon}
        </button>
      ))}
    </div>
  );
};

export default TextFormatMenu; 