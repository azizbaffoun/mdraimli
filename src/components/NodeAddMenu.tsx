import React, { useRef, useEffect } from 'react';

// Import menu icons (adjust paths if needed and add social icon)
import articleIcon from '@/assets/icons/article icon.svg';
import videoIcon from '@/assets/icons/video icon.svg';
import podcastIcon from '@/assets/icons/podcast icon.svg';
import socialIcon from '@/assets/icons/social media icon.svg';

// Define ContentType here or import from a shared location
type ContentType = 'article' | 'video' | 'podcast' | 'socialMedia';

// Define props for the menu component
interface NodeAddMenuProps {
  parentId: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectOption: (parentId: string, childType: ContentType) => void;
  // Specify available options - respecting the new SVG order
  availableOptions: ContentType[];
  // Positioning relative to the plus button
  positionStyle: React.CSSProperties;
}

const NodeAddMenu: React.FC<NodeAddMenuProps> = ({
  parentId,
  isOpen,
  onClose,
  onSelectOption,
  availableOptions,
  positionStyle,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside the menu to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  // Map content types to icons and labels in the desired SVG order
  const menuItems: Record<ContentType, { icon: string; label: string }> = {
    video: { icon: videoIcon, label: 'Video' },
    article: { icon: articleIcon, label: 'Article' },
    socialMedia: { icon: socialIcon, label: 'Social Post' },
    podcast: { icon: podcastIcon, label: 'Podcast' },
  };

  // Define the desired order explicitly
  const orderedTypes: ContentType[] = ['video', 'article', 'socialMedia', 'podcast'];

  // Filter and order menu items based on availableOptions and desired order
  const itemsToShow = orderedTypes
    .filter(type => availableOptions.includes(type)) // Only show available options
    .map(type => ({ type, ...menuItems[type] }))
    .filter(item => item.icon && item.label); // Ensure item is valid

  const handleSelect = (type: ContentType) => {
    onSelectOption(parentId, type);
    // onClose is called inside onSelectOption to ensure proper state management
  };

  return (
    <div
      ref={menuRef}
      className="node-add-menu absolute flex flex-col z-50"
      style={{
        ...positionStyle,
        width: 155.762,
        height: 155,
        background: 'none',
        border: 'none',
        boxShadow: 'none',
        padding: 0,
        borderRadius: 10,
      }}
      onClick={e => e.stopPropagation()}
    >
      {/* SVG background, absolutely positioned */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        width="155.762"
        height="155"
        viewBox="0 0 155.762 155"
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 0, pointerEvents: 'none' }}
      >
        <defs>
          <filter id="Op_component_1" x="0" y="41" width="33.848" height="34" filterUnits="userSpaceOnUse">
            <feOffset dy="2"/>
            <feGaussianBlur stdDeviation="1" result="blur"/>
            <feFlood floodOpacity="0.071"/>
            <feComposite operator="in" in2="blur"/>
            <feComposite in="SourceGraphic"/>
          </filter>
          <filter id="Op_component_2" x="4.966" y="0" width="150.796" height="155" filterUnits="userSpaceOnUse">
            <feOffset dy="2"/>
            <feGaussianBlur stdDeviation="1" result="blur-2"/>
            <feFlood floodOpacity="0.071"/>
            <feComposite operator="in" in2="blur-2"/>
            <feComposite in="SourceGraphic"/>
          </filter>
        </defs>
        {/* Left chevron/arrow, absolutely positioned and vertically centered */}
        <g filter="url(#Op_component_1)">
          <g id="Op_component_1-2" data-name="Op component 1" transform="translate(-809.69 -207.69)" fill="#fff">
            <path d="M 826.6101684570312 277.1861572265625 C 826.1856079101562 277.1861572265625 825.7862548828125 277.0197448730469 825.4857788085938 276.7175598144531 L 813.6531982421875 264.8206176757812 C 813.0309448242188 264.1950378417969 813.0309448242188 263.17724609375 813.6531982421875 262.5517883300781 L 825.4857177734375 250.6546325683594 C 825.7861938476562 250.3525390625 826.185546875 250.1861724853516 826.6101684570312 250.1861724853516 C 827.0348510742188 250.1861724853516 827.4342651367188 250.3525543212891 827.73486328125 250.6546936035156 L 839.5673828125 262.5517578125 C 840.1895141601562 263.17724609375 840.1895141601562 264.195068359375 839.5673828125 264.8206481933594 L 827.7348022460938 276.717529296875 C 827.4342041015625 277.0197143554688 827.0348510742188 277.1861572265625 826.6101684570312 277.1861572265625 Z" stroke="none"/>
            <path d="M 826.6101684570312 250.6861877441406 C 826.319580078125 250.6861877441406 826.046142578125 250.8002014160156 825.8402709960938 251.0072021484375 L 814.0076293945312 262.9044189453125 C 813.578857421875 263.33544921875 813.578857421875 264.036865234375 814.0077514648438 264.468017578125 L 825.84033203125 276.3650207519531 C 826.0462646484375 276.5721130371094 826.3196411132812 276.6861572265625 826.6101684570312 276.6861572265625 C 826.9007568359375 276.6861572265625 827.1742553710938 276.5720825195312 827.3802490234375 276.3649291992188 L 839.2128295898438 264.4680480957031 C 839.6416015625 264.0368957519531 839.6416625976562 263.33544921875 839.2128295898438 262.9043273925781 L 827.38037109375 251.00732421875 C 827.17431640625 250.8002319335938 826.9008178710938 250.6861877441406 826.6101684570312 250.6861877441406 M 826.6101684570312 249.6861877441406 C 827.1455078125 249.6861877441406 827.6807861328125 249.8914489746094 828.0892944335938 250.3020324707031 L 839.921875 262.1991577148438 C 840.7386474609375 263.0202941894531 840.7386474609375 264.3519592285156 839.921875 265.1732177734375 L 828.0892944335938 277.0701293945312 C 827.2723388671875 277.8914794921875 825.9480590820312 277.8915405273438 825.1312255859375 277.0701293945312 L 813.2987060546875 265.1732177734375 C 812.4818115234375 264.3519592285156 812.4818115234375 263.0202941894531 813.2987060546875 262.1991577148438 L 825.1312255859375 250.3020324707031 C 825.5396118164062 249.8914489746094 826.0748901367188 249.6861877441406 826.6101684570312 249.6861877441406 Z" stroke="none" fill="#e4e9ee"/>
          </g>
        </g>
        {/* Main rounded rectangle background */}
        <g filter="url(#Op_component_2)">
          <g id="Op_component_2-2" data-name="Op component 2" transform="translate(7.97 1)" fill="#fff" stroke="#e4e9ee" strokeWidth="1">
            <rect width="144.796" height="149" rx="10" stroke="none"/>
            <rect x="0.5" y="0.5" width="143.796" height="148" rx="9.5" fill="none"/>
          </g>
        </g>
      </svg>
      {/* SVG separators, absolutely positioned above background but below content */}
      <svg
        width="155.762"
        height="155"
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 1, pointerEvents: 'none' }}
      >
        <line x1="27.139" y1="37" x2="136.609" y2="37" stroke="#ecf0f3" strokeWidth="1" />
        <line x1="27.139" y1="73" x2="136.609" y2="73" stroke="#ecf0f3" strokeWidth="1" />
        <line x1="27.139" y1="111" x2="136.609" y2="111" stroke="#ecf0f3" strokeWidth="1" />
      </svg>
      {/* Menu content overlays SVG */}
      <div style={{ position: 'relative', zIndex: 2, width: '100%', height: '100%' }}>
        <ul style={{ padding: 0, margin: 0, width: '100%', listStyle: 'none' }}>
          {itemsToShow.map((item, index) => (
            <li key={item.type} style={{ width: '100%', height: 36, display: 'flex', alignItems: 'center', padding: 0, margin: 0, position: 'relative' }}>
              {/* No divider divs, SVG lines are used instead */}
              <button
                className="hover:bg-gray-100 rounded-md cursor-pointer transition-colors text-[15px] text-left"
                onClick={() => handleSelect(item.type)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  height: '100%',
                  width: '100%',
                  padding: 0,
                  paddingLeft: 27.139,
                  background: 'transparent',
                  border: 'none',
                  fontSize: 15,
                  fontFamily: 'Segoe UI',
                  color: '#222',
                  boxSizing: 'border-box',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <img src={item.icon} alt="" style={{ width: 18, height: 18, marginRight: 12, flexShrink: 0 }} />
                <span style={{ color: '#222', whiteSpace: 'nowrap' }}>{item.label}</span>
              </button>
            </li>
          ))}
          {itemsToShow.length === 0 && (
             <li className="p-2 text-[15px] text-gray-500">No options available</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default NodeAddMenu;