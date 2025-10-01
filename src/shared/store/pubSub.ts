export enum EventKey {
  SEARCH_BAR_SEARCH = "search-bar:search",
  SEARCH_BAR_ADD_PRODUCT = "search-bar:add-product",
}

export type EventHandler<T = unknown> = (payload: T) => void;

export interface PubSub {
  on<T = unknown>(event: EventKey, handler: EventHandler<T>): () => void;
  off<T = unknown>(event: EventKey, handler: EventHandler<T>): void;
  once<T = unknown>(event: EventKey, handler: EventHandler<T>): () => void;
  emit<T = unknown>(event: EventKey, payload: T): void;
  clear(event?: EventKey): void;
  subscriberCount(event?: EventKey): number;
  eventNames(): EventKey[];
}

export function createPubSub(): PubSub {
  const eventToHandlers = new Map<EventKey, Set<EventHandler<unknown>>>();

  const getHandlers = (event: EventKey): Set<EventHandler<unknown>> => {
    let handlers = eventToHandlers.get(event);
    if (!handlers) {
      handlers = new Set<EventHandler<unknown>>();
      eventToHandlers.set(event, handlers);
    }
    return handlers;
  };

  const on = <T = unknown>(event: EventKey, handler: EventHandler<T>): (() => void) => {
    const handlers = getHandlers(event);
    // The internal set stores EventHandler<unknown>; cast is safe for storage
    handlers.add(handler as unknown as EventHandler<unknown>);
    return () => off(event, handler);
  };

  const off = <T = unknown>(event: EventKey, handler: EventHandler<T>): void => {
    const handlers = eventToHandlers.get(event);
    if (!handlers) return;
    handlers.delete(handler as unknown as EventHandler<unknown>);
    if (handlers.size === 0) {
      eventToHandlers.delete(event);
    }
  };

  const once = <T = unknown>(event: EventKey, handler: EventHandler<T>): (() => void) => {
    const wrapper: EventHandler<T> = (payload: T) => {
      off(event, wrapper);
      handler(payload);
    };
    return on(event, wrapper);
  };

  const emit = <T = unknown>(event: EventKey, payload: T): void => {
    const handlers = eventToHandlers.get(event);
    if (!handlers || handlers.size === 0) return;
    // Copy to array to avoid issues if handlers mutate during emit
    const snapshot = Array.from(handlers) as Array<EventHandler<T>>;
    for (const handler of snapshot) {
      handler(payload);
    }
  };

  const clear = (event?: EventKey): void => {
    if (typeof event === 'undefined') {
      eventToHandlers.clear();
      return;
    }
    eventToHandlers.delete(event);
  };

  const subscriberCount = (event?: EventKey): number => {
    if (typeof event === 'undefined') {
      let total = 0;
      for (const setOfHandlers of eventToHandlers.values()) {
        total += setOfHandlers.size;
      }
      return total;
    }
    const handlers = eventToHandlers.get(event);
    return handlers ? handlers.size : 0;
  };

  const eventNames = (): EventKey[] => Array.from(eventToHandlers.keys());

  return { on, off, once, emit, clear, subscriberCount, eventNames };
}

// Shared singleton instance for convenience
export const pubSub: PubSub = createPubSub();


