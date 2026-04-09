/**
 * Format a date string to a human-readable format.
 * @param {string|Date} date
 * @param {Intl.DateTimeFormatOptions} options
 */
export const formatDate = (date, options = { year: 'numeric', month: 'short', day: 'numeric' }) => {
  return new Intl.DateTimeFormat('en-IN', options).format(new Date(date))
}

/**
 * Truncate a string to a max length and append "…".
 */
export const truncate = (str, max = 80) => {
  if (!str) return ''
  return str.length <= max ? str : `${str.slice(0, max)}…`
}

/**
 * Debounce a function call.
 */
export const debounce = (fn, delay = 300) => {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}
