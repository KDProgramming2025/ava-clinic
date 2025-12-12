import { useEffect, useRef } from 'react';

export function useMobileHistoryState(isOpen: boolean, onClose: () => void) {
  const isPoppingRef = useRef(false);
  const onCloseRef = useRef(onClose);

  // Update ref whenever onClose changes to avoid re-triggering the effect
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      const stateId = Date.now();
      // Push the state
      window.history.pushState({ modalOpen: true, id: stateId }, '');

      const onPopState = () => {
        // When back button is pressed, close the modal
        isPoppingRef.current = true;
        onCloseRef.current();
      };

      window.addEventListener('popstate', onPopState);

      return () => {
        window.removeEventListener('popstate', onPopState);
        
        // If we are NOT popping (i.e. programmatic close), we need to go back.
        if (!isPoppingRef.current) {
          // Safety check: only go back if we are actually in our state
          if (window.history.state?.id === stateId) {
            window.history.back();
          }
        }
        // Reset for next time
        isPoppingRef.current = false;
      };
    }
  }, [isOpen]); // Only re-run if isOpen changes
}
