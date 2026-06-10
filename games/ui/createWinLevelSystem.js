// games/ui/createWinLevelSystem.js
// Reusable win level system
// Any game passes in its own winLevelMap and gets back helper functions
// Keeps win level logic completely out of individual game files

/**
 * Create a win level system for a game
 * @param {Record<number, import('../core/types').WinLevelData>} winLevelMap
 * @returns {{
 *   getWinLevelData: (level: number) => import('../core/types').WinLevelData,
 *   getWinLevelDataByAlias: (alias: string) => import('../core/types').WinLevelData | undefined,
 *   isBigWin: (level: number) => boolean,
 *   isMaxWin: (level: number) => boolean,
 * }}
 */
export function createWinLevelSystem(winLevelMap) {
  /**
   * Get win level data by level number
   * Falls back to level 1 if not found
   * @param {number} level
   */
  function getWinLevelData(level) {
    return winLevelMap[level] ?? winLevelMap[1];
  }

  /**
   * Get win level data by alias string
   * @param {string} alias - e.g. 'big', 'mega', 'max'
   */
  function getWinLevelDataByAlias(alias) {
    return Object.values(winLevelMap).find((d) => d.alias === alias);
  }

  /**
   * Returns true if this win level triggers a big win celebration
   * @param {number} level
   */
  function isBigWin(level) {
    return getWinLevelData(level).type === 'big';
  }

  /**
   * Returns true if this is the maximum win level
   * @param {number} level
   */
  function isMaxWin(level) {
    return getWinLevelData(level).alias === 'max';
  }

  return {
    getWinLevelData,
    getWinLevelDataByAlias,
    isBigWin,
    isMaxWin,
  };
}
