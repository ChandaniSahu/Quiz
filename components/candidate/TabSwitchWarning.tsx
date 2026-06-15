'use client';
import Modal from '@/components/common/Modal';

interface TabSwitchWarningProps {
  onClose: () => void;
}

export default function TabSwitchWarning({ onClose }: TabSwitchWarningProps) {
  return (
    <Modal isOpen={true} onClose={onClose} title="⚠️ Warning">
      <div className="text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold mb-4 text-red-600">
          Tab Switch Detected!
        </h3>
        <p className="text-gray-600 mb-6">
          Switching tabs or windows during the quiz is not allowed. 
          If you switch tabs again, your quiz will be automatically submitted.
        </p>
        <button onClick={onClose} className="btn-primary">
          I Understand
        </button>
      </div>
    </Modal>
  );
}
