/**
 * PlayerManager class-based event manager.
 * Provides on, off, and trigger methods for event handling.
 */
class EventManager {
  constructor() {
    this.listeners = {}; // Stores event names as keys and arrays of listener functions as values
  }
  /**
   * Registers a new event listener.
   * @param {string} eventName - The name of the event to listen for.
   * @param {function} listener - The function to be executed when the event is triggered.
   */
  on(eventName, listener) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(listener);
  }

  /**
   * Removes an event listener.
   * @param {string} eventName - The name of the event from which to remove the listener.
   * @param {function} listener - The specific listener function to remove.
   */
  off(eventName, listener) {
    if (this.listeners[eventName]) {
      this.listeners[eventName] = this.listeners[eventName].filter(
        (l) => l !== listener,
      );
    }
  }

  removeAllEvents(eventName, listener) {
    this.listeners = {};
  }

  /**
   * Triggers an event, executing all registered listeners for that event.
   * @param {string} eventName - The name of the event to trigger.
   * @param {*} [data] - Optional data to pass to the listener functions.
   */
  trigger(eventName, data) {
    if (this.listeners[eventName]) {
      this.listeners[eventName].forEach((listener) => {
        listener(data);
      });
    }
  }
}

export default EventManager;
