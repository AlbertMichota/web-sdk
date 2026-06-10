// games/core/createBookPlayer.js
// Plays through a book (array of events from the math-sdk) in sequence
// Each event is passed to the game's bookEventHandlerMap
// Handlers can be sync or async — async ones are awaited before the next fires
// Reusable across all games — the game just provides its own handlerMap

/**
 * Create a book player for a game
 * @param {{ bookEventHandlerMap: Record<string, Function> }} options
 * @returns {{
 *   playBook: (bookEvents: object[]) => Promise<void>,
 *   playBookEvent: (bookEvent: object, context: object) => Promise<void>,
 * }}
 */
export function createBookPlayer({ bookEventHandlerMap }) {

  /**
   * Play a single book event
   * @param {object} bookEvent
   * @param {{ bookEvents: object[] }} context - Full book passed for context-aware handlers
   */
  async function playBookEvent(bookEvent, context) {
    const handler = bookEventHandlerMap[bookEvent.type];

    if (!handler) {
      console.warn(`[BookPlayer] No handler for event type: "${bookEvent.type}"`);
      return;
    }

    await handler(bookEvent, context);
  }

  /**
   * Play through an entire book (array of events) in sequence
   * @param {object[]} bookEvents
   */
  async function playBook(bookEvents) {
    const context = { bookEvents };

    for (const bookEvent of bookEvents) {
      await playBookEvent(bookEvent, context);
    }
  }

  return { playBook, playBookEvent };
}
