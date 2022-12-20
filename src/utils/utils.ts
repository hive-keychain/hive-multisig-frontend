import * as Hive from '@hiveio/dhive';
import { useEffect, useRef } from "react";

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
export function getTimestampInSeconds() {
  return Math.floor(Date.now() / 1000);
}
export function getElapsedTimestampSeconds(old_t: number, new_t: number) {
  return new_t - old_t;
}
export const useDidMountEffect = (func:Function, deps:[any]) => {
  const didMount = useRef(false);

  useEffect(() => {
      if (didMount.current) func();
      else didMount.current = true;
  }, deps);
}

export const removeStringElement = (array:string[], element:string):string[] => {
  const index = array.indexOf(element);
  if(index!==-1){
    return [...array.slice(0,index), ...array.slice(index+1)]
  }
  return [...array];
}

export const castToString = (k: string|Hive.PublicKey):string => {
  return k.toString();
};