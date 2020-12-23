// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
export function requireString(value: any, name: string): void {
  if (typeof value !== 'string' || !value) {
    throw new TypeError(`"${name}" must be a non-empty string`)
  }
}
