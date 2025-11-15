// Simple event emitter for data changes
type EventHandler = () => void

const eventHandlers: Record<string, EventHandler[]> = {}

export const DataEvents = {
  emit(event: string) {
    if (eventHandlers[event]) {
      eventHandlers[event].forEach(handler => handler())
    }
  },

  on(event: string, handler: EventHandler) {
    if (!eventHandlers[event]) {
      eventHandlers[event] = []
    }
    eventHandlers[event].push(handler)
  },

  off(event: string, handler: EventHandler) {
    if (eventHandlers[event]) {
      eventHandlers[event] = eventHandlers[event].filter(h => h !== handler)
    }
  }
}

// Event constants
export const DATA_EVENTS = {
  INCOME_CHANGED: 'income:changed',
  EXPENSE_CHANGED: 'expense:changed',
  TASK_CHANGED: 'task:changed',
  WEIGHT_CHANGED: 'weight:changed',
  EXERCISE_CHANGED: 'exercise:changed',
  MEAL_CHANGED: 'meal:changed',
  SETTINGS_CHANGED: 'settings:changed',
}
