/**
 * Schema Version Management
 * 
 * This file defines the current schema version and tracks changes across versions.
 * Always increment CURRENT_SCHEMA_VERSION when making breaking data structure changes.
 */

export const CURRENT_SCHEMA_VERSION = 1
export const MIN_COMPATIBLE_VERSION = 1
export const APP_VERSION = '0.1.0'

/**
 * Schema Version History:
 * 
 * Version 1 (0.1.0):
 * - Initial MVP release
 * - Core entities: income, expenses, debts, tasks, reminders
 * - Health tracking: weight, exercise, meals
 * - Routines and routine completions
 * - Basic settings
 */

export interface SchemaVersionInfo {
  schemaVersion: number
  appVersion: string
  minCompatibleVersion: number
  releaseDate: string
  changes: string[]
}

export const SCHEMA_HISTORY: Record<number, SchemaVersionInfo> = {
  1: {
    schemaVersion: 1,
    appVersion: '0.1.0',
    minCompatibleVersion: 1,
    releaseDate: '2024-01-01',
    changes: [
      'Initial schema',
      'Finance: income, expenses, debts',
      'Tasks: tasks, reminders',
      'Health: weight, exercise, meals',
      'Routines: routines, routine completions',
      'Settings: user preferences'
    ]
  }
  // Future versions will be added here
  // Example:
  // 2: {
  //   schemaVersion: 2,
  //   appVersion: '0.2.0',
  //   minCompatibleVersion: 1,
  //   releaseDate: '2024-03-01',
  //   changes: [
  //     'Added: goals table',
  //     'Added: subscriptions table',
  //     'Enhanced: custom categories support'
  //   ]
  // }
}

/**
 * Get information about a specific schema version
 */
export function getSchemaInfo(version: number): SchemaVersionInfo | null {
  return SCHEMA_HISTORY[version] || null
}

/**
 * Check if a schema version is compatible with current app
 */
export function isCompatible(schemaVersion: number): boolean {
  return schemaVersion >= MIN_COMPATIBLE_VERSION && schemaVersion <= CURRENT_SCHEMA_VERSION
}

/**
 * Check if migration is needed
 */
export function needsMigration(schemaVersion: number): boolean {
  return schemaVersion < CURRENT_SCHEMA_VERSION
}

/**
 * Check if data is from a newer version
 */
export function isNewerVersion(schemaVersion: number): boolean {
  return schemaVersion > CURRENT_SCHEMA_VERSION
}
