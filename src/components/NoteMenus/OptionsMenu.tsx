import React from 'react';

interface OptionsMenuProps {
  onDuplicate: () => void;
  onDelete: () => void;
}

const OptionsMenu: React.FC<OptionsMenuProps> = ({ onDuplicate, onDelete }) => {
  return (
    <div
      className="absolute top-[-4px] left-[266px] z-[70]"
      onMouseDown={(e) => e.stopPropagation()}
      style={{ width: '135.314px', height: '84.42px' }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="135.314" height="84.42" viewBox="0 0 135.314 84.42">
        <defs>
          <filter id="Path_6" x="0" y="15.349" width="19.755" height="19.755" filterUnits="userSpaceOnUse">
            <feOffset dy="2" in="SourceAlpha"/>
            <feGaussianBlur stdDeviation="1" result="blur"/>
            <feFlood floodOpacity="0.071"/>
            <feComposite operator="in" in2="blur"/>
            <feComposite in="SourceGraphic"/>
          </filter>
          <filter id="Rectangle_717" x="4" y="0" width="131.314" height="84.42" filterUnits="userSpaceOnUse">
            <feOffset dy="2" in="SourceAlpha"/>
            <feGaussianBlur stdDeviation="1" result="blur-2"/>
            <feFlood floodOpacity="0.071"/>
            <feComposite operator="in" in2="blur-2"/>
            <feComposite in="SourceGraphic"/>
          </filter>
          <linearGradient id="linear-gradient" y1="0.365" x2="1" y2="0.058" gradientUnits="objectBoundingBox">
            <stop offset="0" stopColor="#3799db"/>
            <stop offset="1" stopColor="#2db4a6"/>
          </linearGradient>
        </defs>
        <g id="Group_5351" data-name="Group 5351" transform="translate(-66.002 -507.58)">
          <g transform="matrix(1, 0, 0, 1, 66, 507.58)" filter="url(#Path_6)">
            <g id="Path_6-2" data-name="Path 6" transform="translate(3.22 22.91) rotate(-45)" fill="#fff">
              <path d="M 0.7315680384635925 9.510354042053223 C 0.6217180490493774 9.510354042053223 0.5308980345726013 9.472104072570801 0.4616280198097229 9.396674156188965 C 0.3693380355834961 9.296174049377441 0.3251280188560486 9.136283874511719 0.3403280377388 8.958003997802734 L 0.950518012046814 1.80406391620636 C 0.9857780337333679 1.390623927116394 1.329048037528992 0.9986139535903931 1.685118079185486 0.9651539325714111 L 8.191018104553223 0.3537439405918121 C 8.206718444824219 0.3522639572620392 8.222328186035156 0.3515139520168304 8.237427711486816 0.3515139520168304 C 8.347277641296387 0.3515139520168304 8.438097953796387 0.3897639513015747 8.507368087768555 0.4651939570903778 C 8.599658012390137 0.5656939744949341 8.643868446350098 0.7255839705467224 8.628667831420898 0.9038639664649963 L 8.018478393554688 8.057804107666016 C 7.983208179473877 8.471234321594238 7.639937877655029 8.863253593444824 7.283877849578857 8.896703720092773 L 0.7779780030250549 9.508124351501465 C 0.7622780203819275 9.509603500366211 0.7466680407524109 9.510354042053223 0.7315680384635925 9.510354042053223 Z" stroke="none"/>
              <path d="M 8.13045597076416 0.8616323471069336 L 1.731907844543457 1.462953567504883 C 1.645468235015869 1.471083641052246 1.466437816619873 1.638653755187988 1.448708057403564 1.846564292907715 L 0.8385400772094727 9.000234603881836 L 7.23710823059082 8.398903846740723 C 7.323537826538086 8.390773773193359 7.502548217773438 8.223203659057617 7.520287990570068 8.015303611755371 L 8.13045597076416 0.8616323471069336 M 8.237427711486816 -0.1484823226928711 C 8.788044929504395 -0.1484823226928711 9.180063247680664 0.3224992752075195 9.126857757568359 0.9463539123535156 L 8.516668319702148 8.10029411315918 C 8.460497856140137 8.758804321289062 7.929508209228516 9.33824348449707 7.330657958984375 9.394514083862305 L 0.8247575759887695 10.00593376159668 C 0.2259044647216797 10.06221485137939 -0.2140216827392578 9.574013710021973 -0.1578617095947266 8.91551399230957 L 0.4523277282714844 1.761573791503906 C 0.5084877014160156 1.103074073791504 1.039487838745117 0.5236244201660156 1.638338088989258 0.4673442840576172 L 8.144237518310547 -0.1440658569335938 C 8.175745010375977 -0.1470270156860352 8.206850051879883 -0.1484823226928711 8.237427711486816 -0.1484823226928711 Z" stroke="none" fill="#e4e9ee"/>
            </g>
          </g>
          <g transform="matrix(1, 0, 0, 1, 66, 507.58)" filter="url(#Rectangle_717)">
            <g id="Rectangle_717-2" data-name="Rectangle 717" transform="translate(7 1)" fill="#fff" stroke="#e4e9ee" strokeWidth="1">
              <rect width="125.314" height="78.42" rx="14" stroke="none"/>
              <rect x="0.5" y="0.5" width="124.314" height="77.42" rx="13.5" fill="none"/>
            </g>
          </g>
          {/* -- Duplicate Button Area -- */}
          <g
            onClick={onDuplicate}
            style={{ cursor: 'pointer' }}
            aria-label="Duplicate Note"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onDuplicate(); }}
          >
            <rect x="70" y="515" width="125" height="30" fill="transparent" />
            <text id="Duplicate_Delete" data-name="Duplicate Delete" transform="translate(111.843 536.026)" fill="#222" stroke="rgba(0,0,0,0)" strokeWidth="1" fontSize="15" fontFamily="SegoeUI, Segoe UI">
              <tspan x="0" y="0">Duplicate</tspan>
            </text>
            <g id="Iconly_Light-Outline_Paper-Plus" data-name="Iconly/Light-Outline/Paper-Plus" transform="translate(83.291 519.026)">
              <g id="Paper-Plus" transform="translate(3 2)">
                <path id="Combined-Shape" d="M10.974,0A.753.753,0,0,1,11.1.011h.136a.752.752,0,0,1,.541.23l5.066,5.279a.753.753,0,0,1,.208.519v9.3a4.533,4.533,0,0,1-4.471,4.526H4.4A4.473,4.473,0,0,1,0,15.327V4.491A4.6,4.6,0,0,1,4.57.012h6.279A.753.753,0,0,1,10.974,0Zm-.75,1.511H4.573a3.086,3.086,0,0,0-3.072,3V15.34a2.969,2.969,0,0,0,2.913,3.027h8.159a3.028,3.028,0,0,0,2.979-3.025V6.983H13.543a3.332,3.332,0,0,1-3.319-3.325Zm-1.88,6.2a.75.75,0,0,1,.75.75v1.7h1.7a.75.75,0,1,1,0,1.5h-1.7v1.7a.75.75,0,0,1-1.5,0v-1.7h-1.7a.75.75,0,0,1,0-1.5h1.7v-1.7A.75.75,0,0,1,8.344,7.714Zm3.38-5.362V3.659a1.829,1.829,0,0,0,1.821,1.825h1.183Z" fillRule="evenodd" fill="url(#linear-gradient)"/>
              </g>
            </g>
          </g>
          {/* -- Delete Button Area -- */}
          <g
            onClick={onDelete}
            style={{ cursor: 'pointer' }}
            aria-label="Delete Note"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onDelete(); }}
          >
            <rect x="70" y="545" width="125" height="30" fill="transparent" />
            <text id="Delete_Text" data-name="Delete" transform="translate(111.843 570.026)" fill="#222" stroke="rgba(0,0,0,0)" strokeWidth="1" fontSize="15" fontFamily="SegoeUI, Segoe UI">
              <tspan x="0" y="0">Delete</tspan>
            </text>
            <g id="Iconly_Light-Outline_Delete" data-name="Iconly/Light-Outline/Delete" transform="translate(84.52 552.026)">
              <g id="Delete" transform="translate(3 2)">
                <path id="Combined-Shape-2" data-name="Combined-Shape" d="M16.385,6.72a.751.751,0,0,1,.688.808c-.006.068-.548,6.779-.86,9.594a2.976,2.976,0,0,1-3.09,2.842C11.79,19.987,10.5,20,9.247,20c-1.355,0-2.676-.015-3.983-.042a2.967,2.967,0,0,1-3.018-2.829c-.315-2.84-.854-9.534-.859-9.6a.749.749,0,0,1,.687-.808.77.77,0,0,1,.808.687c0,.043.224,2.777.464,5.482l.048.54c.121,1.344.244,2.636.343,3.536a1.472,1.472,0,0,0,1.558,1.494c2.5.053,5.051.056,7.8.006a1.5,1.5,0,0,0,1.626-1.507c.31-2.794.85-9.482.856-9.55A.766.766,0,0,1,16.385,6.72ZM11.345,0a2.033,2.033,0,0,1,1.962,1.506l.254,1.261a.9.9,0,0,0,.865.722h3.282a.75.75,0,1,1,0,1.5H.75a.75.75,0,1,1,0-1.5H4.031l.1-.006A.9.9,0,0,0,4.9,2.767L5.14,1.551A2.043,2.043,0,0,1,7.112,0Zm0,1.5H7.112a.529.529,0,0,0-.512.392l-.233,1.17a2.379,2.379,0,0,1-.128.427h5.979a2.386,2.386,0,0,1-.128-.427l-.243-1.216A.524.524,0,0,0,11.345,1.5Z" fillRule="evenodd" fill="url(#linear-gradient)"/>
              </g>
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
};

export default OptionsMenu;