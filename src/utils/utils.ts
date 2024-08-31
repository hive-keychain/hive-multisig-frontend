import * as Hive from '@hiveio/dhive';
import crypto from 'crypto';
import { KeychainKeyTypes } from 'hive-keychain-commons';
import * as moment from 'moment';
import { useEffect, useRef } from 'react';
import { Authorities } from '../interfaces';
import { IExpiration } from '../interfaces/transaction.interface';
export const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
export const getTimestampInSeconds = () => {
  return Math.floor(Date.now() / 1000);
};
export const getElapsedTimestampSeconds = (old_t: number, new_t: number) => {
  return new_t - old_t;
};
export const useDidMountEffect = (func: Function, deps: [any]) => {
  const didMount = useRef(false);

  useEffect(() => {
    if (didMount.current) func();
    else didMount.current = true;
  }, deps);
};
export const getSeconds = (expiration: IExpiration) => {
  return expiration.minutes * 60;
};
export const getISOStringDate = (expiration: IExpiration) => {
  const expDate = moment().add(expiration.minutes, 'm').toDate();
  return expDate.toISOString();
};
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

export const copyTextToClipboard = (text: string): boolean => {
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
};
export const isNumeric = (n: string) => {
  return !isNaN(parseFloat(n)) && isFinite(parseFloat(n));
};

export const hiveDecimalFormat = (num: number, precision: number = 3) => {
  return ((num * 100) / 100).toFixed(precision);
};
export const capitalizeFirstLetter = (string: String) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const capitalizeOpFirstLetter = (str: string): string => {
  if (!str) return str;
  const formattedStr = str.replace(/_/g, ' ');

  return formattedStr
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
export const getPublicKeys = (
  keyType: KeychainKeyTypes,
  authorities: Authorities,
) => {
  if (authorities) {
    switch (keyType) {
      case KeychainKeyTypes.active:
        return authorities.active.key_auths.map((key) => {
          return key[0];
        });
      case KeychainKeyTypes.posting:
        return authorities.posting.key_auths.map((key) => {
          return key[0];
        });
    }
  }
};

export const base64ToImage = (base64string: string) => {
  const img = new Image();
  img.src = base64string;
  return img;
};

export const generateRandomUint8Array = (length: number): Uint8Array => {
  // Check if crypto.getRandomValues is available
  if (crypto && crypto.getRandomValues) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return array;
  } else {
    // Fallback to Math.random if crypto.getRandomValues is not available (less secure)
    const array = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  }
};

// Function to generate a random 32-character key
export const generateRandomKey = () => {
  const randomBytes = crypto.randomBytes(16);
  const randomHex = randomBytes.toString('hex');
  const key = randomHex.padEnd(32, '0').slice(0, 32);
  return key;
};
