/**
 * @file Hooks - TypeScript type definitions
 * @description Type definitions for custom React hooks
 */

/**
 * @typedef {Object} UseLocalStorageReturn
 * @template T
 * @property {T} value - The stored value
 * @property {function} setValue - Function to update the value
 */

/**
 * @typedef {Object} UseDebounceReturn
 * @template T
 * @property {T} value - The debounced value
 */

/**
 * @typedef {Object} UseOnlineStatusReturn
 * @property {boolean} isOnline - Whether the browser is online
 */

/**
 * @typedef {Object} UseIntervalParams
 * @property {function} callback - Function to execute
 * @property {number|null} delay - Delay in milliseconds
 * @property {boolean} enabled - Whether the interval is active
 */

/**
 * @typedef {Object} UseClipboardReturn
 * @property {function} copy - Function to copy text to clipboard
 * @property {boolean} copied - Whether text was recently copied
 */

/**
 * @typedef {Object} UseDeviceTypeReturn
 * @property {boolean} isMobile - Whether device is mobile
 * @property {boolean} isTablet - Whether device is tablet
 * @property {boolean} isDesktop - Whether device is desktop
 */

/**
 * @typedef {Object} UseSalesParams
 * @property {Object} db - Firestore database instance
 * @property {number} pageSize - Number of items per page
 */

/**
 * @typedef {Object} UseSalesReturn
 * @property {Array} sales - Array of sales data
 * @property {boolean} loading - Loading state
 * @property {function} loadMore - Function to load more items
 * @property {boolean} hasMore - Whether more items are available
 * @property {number} total - Total number of items
 * @property {function} refresh - Function to refresh data
 */

/**
 * @typedef {Object} UseFormStateReturn
 * @property {Object} values - Form values
 * @property {Object} errors - Form errors
 * @property {function} handleChange - Function to update a field
 * @property {function} validate - Function to validate form
 * @property {function} resetForm - Function to reset form
 * @property {function} setValues - Function to set all values
 * @property {function} setErrors - Function to set all errors
 */

/**
 * @typedef {Object} UseNotificationReturn
 * @property {Array} notifications - Array of active notifications
 * @property {function} addNotification - Add a new notification
 * @property {function} removeNotification - Remove a notification
 * @property {function} success - Show success notification
 * @property {function} error - Show error notification
 * @property {function} warning - Show warning notification
 * @property {function} info - Show info notification
 */

/**
 * @typedef {Object} UseThemeReturn
 * @property {string} theme - Current theme ('dark' | 'light')
 * @property {function} toggleTheme - Toggle between dark and light
 * @property {function} setTheme - Set specific theme
 */

export const UseLocalStorageReturn = {};
export const UseDebounceReturn = {};
export const UseOnlineStatusReturn = {};
export const UseIntervalParams = {};
export const UseClipboardReturn = {};
export const UseDeviceTypeReturn = {};
export const UseSalesParams = {};
export const UseSalesReturn = {};
export const UseFormStateReturn = {};
export const UseNotificationReturn = {};
export const UseThemeReturn = {};