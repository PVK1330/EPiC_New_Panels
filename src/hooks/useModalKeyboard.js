import { useEffect } from 'react';

/**
 * Shared keyboard handling for modals.
 *
 * Adds a window keydown listener while the modal is open and calls onClose()
 * when the Escape key is pressed. The listener is removed automatically when
 * the modal closes or the component unmounts.
 *
 * @param {Object}   params
 * @param {boolean}  params.isOpen  Whether the modal is currently open.
 * @param {Function} params.onClose Callback invoked when Escape is pressed.
 */
const useModalKeyboard = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
};

export default useModalKeyboard;
