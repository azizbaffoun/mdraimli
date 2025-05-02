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
      style={{ width: '133.872px', height: '84.42px' }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="133.872" height="84.42" viewBox="0 0 133.872 84.42">
        <defs>
          <linearGradient id="linear-gradient" y1="0.365" x2="1" y2="0.058" gradientUnits="objectBoundingBox">
            <stop offset="0" stopColor="#3799db"/>
            <stop offset="1" stopColor="#2db4a6"/>
          </linearGradient>
        </defs>
        <g id="Group_5042" data-name="Group 5042" transform="translate(-67.445 -507.58)">
          <path d="M 111.6305999755859 79.50009918212891 L 14.3163013458252 79.50009918212891 C 10.71041774749756 79.50009918212891 7.320384502410889 78.09577941894531 4.770651340484619 75.54581451416016 C 2.220968008041382 72.99591827392578 0.8168013095855713 69.60569763183594 0.8168013095855713 65.99970245361328 L 0.8168013095855713 27.04506492614746 L 0.8168013095855713 26.86246490478516 L 0.6991346478462219 26.72284889221191 L -1.515765309333801 24.09478187561035 C -1.782815337181091 23.7774829864502 -1.817298650741577 23.25718307495117 -1.589331984519958 22.98159980773926 L 0.7018846273422241 20.21491622924805 L 0.8168013095855713 20.07614898681641 L 0.8168013095855713 19.89599800109863 L 0.8168013095855713 15.57989883422852 C 0.8168013095855713 11.97396564483643 2.220968008041382 8.583915710449219 4.770634651184082 6.034232139587402 C 7.32031774520874 3.484565496444702 10.71036815643311 2.080398797988892 14.3163013458252 2.080398797988892 L 111.6305999755859 2.080398797988892 C 115.2366027832031 2.080398797988892 118.6268157958984 3.484565496444702 121.1767196655273 6.034248828887939 C 123.7266845703125 8.583982467651367 125.1310043334961 11.97401523590088 125.1310043334961 15.57989883422852 L 125.1310043334961 65.99970245361328 C 125.1310043334961 69.60562896728516 123.7266693115234 72.995849609375 121.1767196655273 75.54581451416016 C 118.6267547607422 78.09576416015625 115.2365341186523 79.50009918212891 111.6305999755859 79.50009918212891 Z" fill="#fff" transform="translate(72.685 507)"/>
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
            <text id="Duplicate_Text" data-name="Duplicate" transform="translate(111.843 536.026)" fill="#222" stroke="rgba(0,0,0,0)" strokeWidth="1" fontSize="15" fontFamily="SegoeUI, Segoe UI">
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