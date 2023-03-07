import * as Hive from '@hiveio/dhive';
import { useEffect, useRef } from 'react';
import { IExpiration } from '../interfaces/transaction.interface';

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
export function getTimestampInSeconds() {
  return Math.floor(Date.now() / 1000);
}
export function getElapsedTimestampSeconds(old_t: number, new_t: number) {
  return new_t - old_t;
}
export const useDidMountEffect = (func: Function, deps: [any]) => {
  const didMount = useRef(false);

  useEffect(() => {
    if (didMount.current) func();
    else didMount.current = true;
  }, deps);
};
export function getSeconds(expiration: IExpiration) {
  return (
    expiration.days * 86400 + expiration.hours * 3600 + expiration.minutes * 60
  );
}
export const removeStringElement = (
  array: string[],
  element: string,
): string[] => {
  const index = array.indexOf(element);
  if (index !== -1) {
    return [...array.slice(0, index), ...array.slice(index + 1)];
  }
  return [...array];
};

export const castToString = (k: string | Hive.PublicKey): string => {
  return k.toString();
};

export function copyTextToClipboard(text: string): boolean {
  var textArea = document.createElement('textarea');
  textArea.style.background = 'transparent';
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    document.body.removeChild(textArea);
    return false;
  }
}
export function isNumeric(n: string) {
  return !isNaN(parseFloat(n)) && isFinite(parseFloat(n));
}

export function hiveDecimalFormat(num: number, precision: number = 3) {
  return ((num * 100) / 100).toFixed(precision);
}
export function capitalizeFirstLetter(string: String) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
