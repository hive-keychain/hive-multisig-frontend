export function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}
export function getTimestampInSeconds () {
    return Math.floor(Date.now() / 1000)
  }
