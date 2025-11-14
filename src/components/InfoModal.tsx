'use client';

import { Modal, ModalActions } from '@/components/ui/modal';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal = ({ isOpen, onClose }: InfoModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="How to Play"
      actions={
        <ModalActions
          primaryAction={{
            label: 'Got it!',
            onClick: onClose
          }}
        />
      }
    >
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Objective</h3>
        <p>Guess the exact 6-character equation that equals the target number.</p>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Rules</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Use numbers (0-9) and operators (+, -, ×, ÷)</li>
          <li>Equation must be exactly 6 characters long</li>
          <li>Equation must equal the target number</li>
          <li>You must use the same numbers and operators as the target equation</li>
          <li>Order of operations applies (× and ÷ before + and -)</li>
          <li>No negative numbers allowed</li>
          <li>Commutative solutions are accepted (e.g., 2+3+1 and 1+2+3)</li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Feedback</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span><span className="text-green-500 font-semibold">Green:</span> Correct number/operator in correct position</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span><span className="text-yellow-500 font-semibold">Yellow:</span> Correct number/operator in wrong position</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-500 rounded"></div>
            <span><span className="text-gray-500 font-semibold">Gray:</span> Number/operator not in the equation</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Game Modes</h3>
        <div className="space-y-1">
          <p><span className="font-semibold">Daily Mode:</span> Same equation for everyone each day</p>
          <p><span className="font-semibold">Practice Mode:</span> Random equations for unlimited practice</p>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Controls</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Click virtual keyboard or use physical keyboard</li>
          <li>Press Enter to submit your guess</li>
          <li>Press Backspace to delete last character</li>
          <li>Use numbers 0-9 and operators +, -, *, /</li>
        </ul>
      </div>
    </Modal>
  );
};
