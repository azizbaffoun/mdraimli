import  { ReactNode, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

interface PortalContainerProps {
  id: string;
  children: ReactNode;
}

/**
 * A dedicated portal container for BubbleMenu and other elements that need to be
 * rendered outside of the React flow hierarchy.
 * 
 * This component handles proper creation and cleanup of the portal container DOM element.
 */
const PortalContainer = ({ id, children }: PortalContainerProps) => {
  const portalRef = useRef<HTMLDivElement | null>(null);
  
  useEffect(() => {
    // Prevent executing in SSR
    if (typeof document === 'undefined') return;
    
    // Check if container already exists (prevents duplication)
    let portalContainer = document.getElementById(`note-portal-${id}`);
    
    if (!portalContainer) {
      // Create a container for this note's portals
      portalContainer = document.createElement('div');
      portalContainer.id = `note-portal-${id}`;
      portalContainer.style.position = 'absolute';
      portalContainer.style.top = '0';
      portalContainer.style.left = '0';
      portalContainer.style.zIndex = '9999';
      portalContainer.dataset.noteId = id;
      
      // Add to document
      document.body.appendChild(portalContainer);
    }
    
    portalRef.current = portalContainer as HTMLDivElement;
    
    // Cleanup function
    return () => {
      // Important: Use this approach for safer cleanup during React unmounting
      const cleanupContainer = () => {
        const container = document.getElementById(`note-portal-${id}`);
        if (container && document.body.contains(container)) {
          document.body.removeChild(container);
        }
        
        // Also cleanup any orphaned tippy elements that might be related
        // to this note to prevent React DOM unmounting issues
        const tippyElements = document.querySelectorAll(`[data-tippy-root]`);
        tippyElements.forEach(el => {
          try {
            if (el.parentElement && document.body.contains(el.parentElement)) {
              el.parentElement.removeChild(el);
            } else if (document.body.contains(el)) {
              document.body.removeChild(el);
            } else {
              el.remove(); // Fallback
            }
          } catch (e) {
            console.error('Error removing tippy element:', e);
          }
        });
        
        // Also look for elements with the bubble-menu class
        const bubbleMenus = document.querySelectorAll('.tippy-box');
        bubbleMenus.forEach(el => {
          try {
            if (el.parentElement) {
              el.parentElement.remove();
            }
          } catch (e) {
            console.error('Error removing bubble menu:', e);
          }
        });
      };
      
      // If window exists, use requestAnimationFrame to do cleanup in next frame
      // This helps prevent React DOM errors during unmounting
      if (typeof window !== 'undefined') {
        requestAnimationFrame(() => {
          cleanupContainer();
        });
      } else {
        cleanupContainer();
      }
    };
  }, [id]);
  
  // Don't render anything if we don't have a portal container
  if (!portalRef.current) return null;
  
  return ReactDOM.createPortal(children, portalRef.current);
};

export default PortalContainer; 