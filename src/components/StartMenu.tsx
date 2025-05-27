import React, { useRef, useEffect } from 'react';

interface StartMenuProps {
  isOpen: boolean;
  onSelect: (type: 'topicalKeyword' | 'offer' | 'event') => void;
  onClose: () => void;
  className?: string;
}



const StartMenu: React.FC<StartMenuProps> = ({ isOpen, onSelect, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);
  if (!isOpen) return null;

  // Use positioning from the original StartMenu component structure,
  // combined with the fixed dimensions from the provided SVG UI.
  return (
    <div
      ref={menuRef}
      className={ "start-menu"}
      style={{
        marginLeft: 7.9, // Set precise 7.9px gap between StartMenu and PopupSelect
      }}>
        <ul>
          <li><a href="#" onClick={() => { onSelect('topicalKeyword'); onClose(); }} ><i className="topical-icon"></i> Topical Keyword</a></li>
          <li><a href="#" onClick={() => { /*onSelect('offer'); onClose();*/ }}><i className="offer-icon"></i> Offer <span>(Coming Soon!)</span></a></li>
          <li><a href="#" onClick={() => { /*onSelect('event'); onClose();*/ }}><i className="event-icon"></i> Event <span>(Coming Soon!)</span></a></li>
        </ul>
    </div>
  );
};

export default StartMenu;