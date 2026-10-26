export function refreshIntervalForVisibility(hidden: boolean, activeMs = 15000): number | false { return hidden ? false : activeMs; }
