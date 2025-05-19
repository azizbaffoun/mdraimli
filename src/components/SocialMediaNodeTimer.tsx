import React from 'react';

interface SocialMediaNodeTimerProps {
  badgeNumber?: number | null;
  delayValue?: string | null;
  color?: string;
  nodeName: string;
  gradientId?: string;
}

const SocialMediaNodeTimer: React.FC<SocialMediaNodeTimerProps> = ({ badgeNumber, delayValue, color = '#fc8500', nodeName, gradientId }) => {
  // If both badgeNumber and delayValue are null or undefined, just render the node name
  if ((badgeNumber === null || badgeNumber === undefined) &&
      (delayValue === null || delayValue === undefined)) {
    return <div style={{ fontSize: '16px', color: '#222' }}>{nodeName}</div>;
  }

  // Determine if we should use gradient or solid color
  const useGradient = !!gradientId;
  const fillColor = useGradient ? `url(#${gradientId})` : color;

  return (
    <div className="flex flex-col items-center pointer-events-none">
      {/* Node name with badge number if provided */}
      <div className="flex items-center justify-center">
        {badgeNumber !== null && badgeNumber !== undefined && (
          <span style={{ marginRight: '4px', display: 'flex', alignItems: 'center' }}>
            <span style={{ color : '#FC8500', fontWeight: 700, fontSize: '16px'}}>{badgeNumber}</span>
          </span>
        )}
        <span style={{ fontSize: '16px', color: '#222' }}>{nodeName}</span>
      </div>

      {/* Calendar icon and string if provided */}
      {delayValue !== null && delayValue !== undefined && (
        <div className="flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            width="16"
            height="16"
            viewBox="0 0 16.378 18.058"
            style={{ marginRight: '3px', display: 'flex', alignItems: 'center' }}
          >
            <g id="calendar" transform="translate(-2.25 -1.25)">
              <path id="Path_470" data-name="Path_470" d="M7.886,5.069a.636.636,0,0,1-.636-.636V1.886a.636.636,0,0,1,1.273,0V4.432A.636.636,0,0,1,7.886,5.069Z" transform="translate(-0.804 0)" fill={fillColor}/>
              <path id="Path_471" data-name="Path_471" d="M15.886,5.069a.636.636,0,0,1-.636-.636V1.886a.636.636,0,1,1,1.273,0V4.432A.636.636,0,0,1,15.886,5.069Z" transform="translate(-2.091 0)" fill={fillColor}/>
              <path id="Path_472" data-name="Path_472" d="M17.65,9.613H3.38a.636.636,0,0,1,0-1.273H17.65a.636.636,0,0,1,0,1.273Z" transform="translate(-0.076 -1.14)" fill={fillColor}/>
              <path id="Path_473" data-name="Path_473" d="M7.079,2.75H13.8a4.778,4.778,0,0,1,3.664,1.355,4.923,4.923,0,0,1,1.166,3.471v7.134a4.923,4.923,0,0,1-1.166,3.471A4.778,4.778,0,0,1,13.8,19.535H7.079A4.778,4.778,0,0,1,3.416,18.18,4.923,4.923,0,0,1,2.25,14.709V7.576A4.923,4.923,0,0,1,3.416,4.105,4.778,4.778,0,0,1,7.079,2.75ZM13.8,18.276a3.588,3.588,0,0,0,2.74-.953,3.726,3.726,0,0,0,.829-2.614V7.576a3.726,3.726,0,0,0-.829-2.614,3.588,3.588,0,0,0-2.74-.953H7.079a3.588,3.588,0,0,0-2.74.953A3.726,3.726,0,0,0,3.51,7.576v7.134a3.726,3.726,0,0,0,.829,2.614,3.588,3.588,0,0,0,2.74.953Z" transform="translate(0 -0.227)" fill={fillColor}/>
              <path id="Path_474" data-name="Path_474" d="M15.551,14.4h-.008a.849.849,0,1,1,0-1.7h.008a.849.849,0,1,1,0,1.7Z" transform="translate(-2.005 -1.843)" fill={fillColor}/>
              <path id="Path_475" data-name="Path_475" d="M15.551,17.4h-.008a.849.849,0,1,1,0-1.7h.008a.849.849,0,1,1,0,1.7Z" transform="translate(-2.005 -2.326)" fill={fillColor}/>
              <path id="Path_476" data-name="Path_476" d="M11.852,14.4h-.008a.849.849,0,1,1,0-1.7h.008a.849.849,0,1,1,0,1.7Z" transform="translate(-1.409 -1.843)" fill={fillColor}/>
              <path id="Path_477" data-name="Path_477" d="M11.852,17.4h-.008a.849.849,0,1,1,0-1.7h.008a.849.849,0,1,1,0,1.7Z" transform="translate(-1.409 -2.326)" fill={fillColor}/>
              <path id="Path_478" data-name="Path_478" d="M8.15,14.4H8.143a.849.849,0,0,1,0-1.7H8.15a.849.849,0,1,1,0,1.7Z" transform="translate(-0.813 -1.843)" fill={fillColor}/>
              <path id="Path_479" data-name="Path_479" d="M8.15,17.4H8.143a.849.849,0,0,1,0-1.7H8.15a.849.849,0,1,1,0,1.7Z" transform="translate(-0.813 -2.326)" fill={fillColor}/>
            </g>
          </svg>
          <span style={{ fontSize: '16px', color: '#222', display: 'flex', alignItems: 'center' }}>
            {delayValue}
          </span>
        </div>
      )}
    </div>
  );
};

export default SocialMediaNodeTimer;
