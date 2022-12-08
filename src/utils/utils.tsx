export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
export function getTimestampInSeconds() {
  return Math.floor(Date.now() / 1000);
}

export function getElapsedTimestampSeconds(old_t: number, new_t: number) {
  return new_t - old_t;
}
