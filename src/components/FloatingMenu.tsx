import React from 'react';
import styles from '../styles/FloatingMenu.module.css';
import { Editor } from '@tiptap/react';

interface FloatingMenuProps {
  editor: Editor;
  placement?: 'top' | 'bottom';
  style?: React.CSSProperties;
}

const FloatingMenu: React.FC<FloatingMenuProps> = ({ editor, placement = 'top', style }) => {
  if (!editor) return null;

  const buttons = [
    {
      label: 'Bold',
      onClick: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive('bold'),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="10.7" height="14" viewBox="0 0 10.7 14">
        <path id="Path_1474" data-name="Path 1474" d="M66.25,45.8A3.68,3.68,0,0,0,68,43a3.93,3.93,0,0,0-3.86-4H57.65V53h7a3.74,3.74,0,0,0,3.7-3.78V49.1a3.64,3.64,0,0,0-2.1-3.3ZM59.65,41h4.2a2,2,0,0,1,.63,3.91,2.228,2.228,0,0,1-.63.09h-4.2Zm4.6,10h-4.6V47h4.6a2,2,0,0,1,.63,3.91,2.228,2.228,0,0,1-.63.09Z" transform="translate(-57.65 -39)"/>
      </svg>
      ),
    },
    {
      label: 'Italic',
      onClick: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive('italic'),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="4.88" height="14" viewBox="0 0 4.88 14">
  <path id="Path_1475" data-name="Path 1475" d="M106.76,43h2l-2.2,10h-2Zm1.68-4a1,1,0,1,0,.707.293A1,1,0,0,0,108.44,39Z" transform="translate(-104.56 -39)"/>
</svg>

      ),
    },
    {
      label: 'Underline',
      onClick: () => editor.chain().focus().toggleUnderline().run(),
      isActive: editor.isActive('underline'),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="17" viewBox="0 0 14 17">
        <path id="Path_1476" data-name="Path 1476" d="M158,54v2H144V54Zm-3-6.785a4,4,0,0,1-5.74,3.4,3.751,3.751,0,0,1-2.26-3.53v-8.08h-2v8.21a6,6,0,0,0,8,5.44,5.852,5.852,0,0,0,4-5.65v-8h-2ZM155,39h0Zm-8,0h0Z" transform="translate(-144 -39)"/>
      </svg>
      
      ),
    },
    {
      label: 'Strike',
      onClick: () => editor.chain().focus().toggleStrike().run(),
      isActive: editor.isActive('strike'),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="14.011" viewBox="0 0 18 14.011">
  <path id="Path_1477" data-name="Path 1477" d="M186,46.2h18v1.5h-4.366a3.6,3.6,0,0,1,.35,1.593,3.251,3.251,0,0,1-1.315,2.7,5.548,5.548,0,0,1-3.466,1,6.444,6.444,0,0,1-2.624-.539,4.459,4.459,0,0,1-1.892-1.488,3.67,3.67,0,0,1-.671-2.155V48.7h2v.113a2.187,2.187,0,0,0,.854,1.831,3.691,3.691,0,0,0,2.328.679,3.388,3.388,0,0,0,2.077-.546,1.734,1.734,0,0,0,.7-1.467,1.7,1.7,0,0,0-.647-1.434,3.048,3.048,0,0,0-.274-.177H186Zm13.345-5.143a4.187,4.187,0,0,0-1.721-1.514A5.63,5.63,0,0,0,195.111,39a5.163,5.163,0,0,0-3.364,1.062,3.36,3.36,0,0,0-1.307,2.706,3.238,3.238,0,0,0,.322,1.428h2.6c-.083-.054-.185-.106-.252-.161a1.608,1.608,0,0,1-.653-1.3,1.8,1.8,0,0,1,.688-1.511,3.131,3.131,0,0,1,1.97-.552,3.048,3.048,0,0,1,2.106.669,2.348,2.348,0,0,1,.736,1.833v.113h2v-.113a3.906,3.906,0,0,0-.611-2.114Z" transform="translate(-186 -38.995)"/>
</svg>

      ),
    },
    {
      label: 'Highlight',
      onClick: () => editor.chain().focus().toggleHighlight().run(),
      isActive: editor.isActive('highlight'),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18.412" height="15.002" viewBox="0 0 18.412 15.002">
  <path id="Path_1478" data-name="Path 1478" d="M280.918,46.241l7.747-5.39,1.18,1.3-6.094,7.208Zm-2.331.411,4.536,4.983a.934.934,0,0,0,1.4-.091l7.451-8.813a.908.908,0,0,0,.022-1.2l-2.513-2.761a.908.908,0,0,0-1.2-.091l-9.474,6.591a.936.936,0,0,0-.421.64.933.933,0,0,0,.2.74Zm-4.793,5.876,5.617.972,1.479-1.346-3.029-3.328Z" transform="translate(-273.794 -38.498)"/>
</svg>

      ),
    },
  ];

  const listButtons = [
    {
      label: 'Task List',
      onClick: () => editor.chain().focus().toggleTaskList().run(),
      isActive: editor.isActive('taskList'),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="29" height="12" viewBox="0 0 29 12">
  <g id="Group_5351" data-name="Group 5351" transform="translate(-123.085 -787.5)">
    <path id="Path_1083" data-name="Path 1083" d="M434,52h6V50h-6Zm0-7v2h12V45Zm0-5v2h18V40Z" transform="translate(-310.915 747.5)"/>
    <path id="Path_1084" data-name="Path 1084" d="M459,48.5l4-5h-8Z" transform="translate(-310.915 747)"/>
  </g>
</svg>

      ),
    },
    {
      label: 'Ordered List',
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive('orderedList'),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="29.5" height="14" viewBox="0 0 29.5 14">
        <g id="Group_5352" data-name="Group 5352" transform="translate(-174.585 -786.5)">
          <path id="Path_1085" data-name="Path 1085" d="M485.5,50h2v.5h-1v1h1V52h-2v1h3V49h-3Zm1-7h1V39h-2v1h1Zm-1,2h1.8l-1.8,2.1V48h3V47h-1.8l1.8-2.1V44h-3Zm5-5v2h14V40Zm0,12h14V50h-14Zm0-5h14V45h-14Z" transform="translate(-310.915 747.5)"/>
          <path id="Path_1086" data-name="Path 1086" d="M511,48.5l4-5h-8Z" transform="translate(-310.915 747)"/>
        </g>
      </svg>
      
      ),
    },
    {
      label: 'Bullet List',
      onClick: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive('bulletList'),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="29.5" height="13" viewBox="0 0 29.5 13">
        <g id="Group_5353" data-name="Group 5353" transform="translate(-226.585 -786.5)">
          <path id="Path_1087" data-name="Path 1087" d="M539,44.5a1.5,1.5,0,1,0,1.5,1.5A1.538,1.538,0,0,0,539,44.5Zm0-5a1.5,1.5,0,1,0,1.5,1.5A1.538,1.538,0,0,0,539,39.5Zm0,10a1.5,1.5,0,1,0,1.5,1.5A1.538,1.538,0,0,0,539,49.5Zm3.5-9.5v2h14V40Zm0,12h14V50h-14Zm0-5h14V45h-14Z" transform="translate(-310.915 747)"/>
          <path id="Path_1088" data-name="Path 1088" d="M563,48.5l4-5h-8Z" transform="translate(-310.915 747)"/>
        </g>
      </svg>
      
      
      ),
    },
    {
      label: 'Align Left',
      onClick: () => editor.chain().focus().setTextAlign('left').run(),
      isActive: editor.isActive({ textAlign: 'left' }),
      icon: (
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="14" viewBox="0 0 18 14">
  <path id="Path_1479" data-name="Path 1479" d="M590,43v6l3-3Zm0,10h18V51H590Zm0-12h18V39H590Zm6,4h12V43H596Zm0,4h12V47H596Z" transform="translate(-590 -39)"/>
</svg>

      
      ),
    },
    {
      label: 'Align Right',
      onClick: () => editor.chain().focus().setTextAlign('right').run(),
      isActive: editor.isActive({ textAlign: 'right' }),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="14" viewBox="0 0 18 14">
        <g id="Group_5354" data-name="Group 5354" transform="translate(-634 -39)" opacity="0.25">
          <path id="Path_1090" data-name="Path 1090" d="M634,46l3,3V43Zm0,7h18V51H634Zm0-12h18V39H634Zm6,4h12V43H640Zm0,4h12V47H640Z"/>
        </g>
      </svg>
      
      ),
    },
  ];

  return (
    <div 
      className={styles.floatingMenu} 
      data-placement={placement}
      style={style}
    >
      <div className={styles.buttonRow}>
        {buttons.map((button) => (
          <button
            key={button.label}
            onClick={button.onClick}
            className={`${styles.menuButton} ${button.isActive ? styles.active : ''}`}
            title={button.label}
            type="button"
          >
            {button.icon}
          </button>
        ))}
      </div>
      
      <div className={styles.divider} />
      
      <div className={styles.buttonRow}>
        {listButtons.map((button) => (
          <button
            key={button.label}
            onClick={button.onClick}
            className={`${styles.menuButton} ${button.isActive ? styles.active : ''}`}
            title={button.label}
            type="button"
          >
            {button.icon}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FloatingMenu; 