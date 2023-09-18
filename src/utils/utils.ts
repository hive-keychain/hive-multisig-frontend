import * as Hive from '@hiveio/dhive';
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
  return (
    expiration.days * 86400 + expiration.hours * 3600 + expiration.minutes * 60
  );
};
export const getISOStringDate = (expiration: IExpiration) => {
  const expDate = moment()
    .add(expiration.days, 'd')
    .add(expiration.hours, 'h')
    .add(expiration.minutes, 'm')
    .toDate();
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
