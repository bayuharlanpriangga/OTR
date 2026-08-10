// OTR — Event Bus
// Pub/sub minimal. Dipakai supaya komponen tidak saling import langsung
// (mis. toast service bisa dengar event "toast:show" dari mana saja).

const listeners = new Map();

/**
 * @param {string} event
 * @param {(payload:any)=>void} handler
 * @returns {() => void} unsubscribe function
 */
export function on(event, handler) {
  if (!listeners.has(event)) listeners.set(event, new Set());
  listeners.get(event).add(handler);
  return () => off(event, handler);
}

export function off(event, handler) {
  listeners.get(event)?.delete(handler);
}

export function emit(event, payload) {
  listeners.get(event)?.forEach((handler) => {
    try {
      handler(payload);
    } catch (err) {
      console.error(`[event-bus] handler error for "${event}"`, err);
    }
  });
}
