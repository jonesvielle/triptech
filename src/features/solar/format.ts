export function formatNaira(value: number) {
  return `₦${Math.round(value).toLocaleString()}`;
}

export function formatWh(value: number) {
  return `${Math.round(value).toLocaleString()} Wh`;
}

export function formatW(value: number) {
  return `${Math.round(value).toLocaleString()} W`;
}

export function formatVa(value: number) {
  return `${Math.round(value).toLocaleString()} VA`;
}
