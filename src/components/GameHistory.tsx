'use client';

import { Modal } from '@/components/ui/modal';
import { UserMetadataService } from '@/services/userMetadataService';
import { format } from 'date-fns';
import { useDynamicContext, useIsLoggedIn } from '@dynamic-labs/sdk-react-core';
import { useGameStore } from '@/store/gameStore';

interface GameHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GameHistory = ({ isOpen, onClose }: GameHistoryProps) => {
  const { user } = useDynamicContext();
  const isLoggedIn = useIsLoggedIn();
  const { isClient } = useGameStore();

  // Only render if client is ready, user is logged in, and user exists
  if (!isClient || !isLoggedIn || !user) {
    return null;
  }

  const history = UserMetadataService.getUserMetadata(user)?.history || [];
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy HH:mm');
    } catch {
      return dateString;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Game History"
      actions={
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Close
        </button>
      }
    >
      {history.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No game history yet.</p>
          <p className="text-sm mt-2">Start playing to see your history here!</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {history
            .slice()
            .reverse()
            .map((entry) => (
              <div
                key={entry.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-sm font-semibold ${
                          entry.won
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {entry.won ? '✓ Won' : '✗ Lost'}
                      </span>
                      {entry.isPracticeMode && (
                        <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                          Practice
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(entry.date)}
                    </div>
                  </div>
                  {entry.won && (
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {entry.guesses} {entry.guesses === 1 ? 'guess' : 'guesses'}
                    </div>
                  )}
                </div>
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Equation: </span>
                    <span className="font-mono font-semibold text-gray-900 dark:text-white">
                      {entry.equation}
                    </span>
                  </div>
                  <div className="text-sm mt-1">
                    <span className="text-gray-500 dark:text-gray-400">Target: </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {entry.targetNumber}
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </Modal>
  );
};

