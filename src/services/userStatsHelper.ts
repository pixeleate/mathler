import { GameHistoryEntry } from './userMetadataService';

/**
 * Helper functions to compute statistics from game history
 */
export class UserStatsHelper {
  /**
   * Calculate stats from history array
   */
  static calculateStats(history: GameHistoryEntry[]) {
    const wonGames = history.filter((h) => h.won);
    const lostGames = history.filter((h) => !h.won);

    // Calculate current streak
    let currentStreak = 0;
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].won) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate max streak
    let maxStreak = 0;
    let tempStreak = 0;
    for (const game of history) {
      if (game.won) {
        tempStreak++;
        maxStreak = Math.max(maxStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    // Calculate guess distribution
    const guessDistribution = [0, 0, 0, 0, 0, 0];
    wonGames.forEach((game) => {
      if (game.guesses >= 1 && game.guesses <= 6) {
        guessDistribution[game.guesses - 1]++;
      }
    });

    return {
      totalGamesPlayed: history.length,
      totalGamesWon: wonGames.length,
      totalGamesLost: lostGames.length,
      winRate:
        history.length > 0 ? (wonGames.length / history.length) * 100 : 0,
      currentStreak,
      maxStreak,
      guessDistribution,
    };
  }
}
