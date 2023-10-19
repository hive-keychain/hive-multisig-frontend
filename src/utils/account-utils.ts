import * as Hive from '@hiveio/dhive';
import {
  Authorities,
  IUpdateAuthorityThreshold,
  IUpdateAuthorityWeight,
  UPDATE_TARGET_ACCOUNT_TYPE,
  UPDATE_TARGET_AUTHORITY_TYPE,
} from '../interfaces';

export const UpdateAuthorityWeight = (
  props: IUpdateAuthorityWeight,
  weight: number,
): Authorities => {
  const newAuthority: Hive.Authority = JSON.parse(
    JSON.stringify(props.targetAuthority),
  );
  const newAuthorities: Authorities = JSON.parse(
    JSON.stringify(props.authorities),
  );

  let index = 0;
  switch (props.targetAccountType) {
    case UPDATE_TARGET_ACCOUNT_TYPE.ACCOUNT:
      index = newAuthority.account_auths.findIndex(
        (acc) => acc[0] === props.targetAuthAccount[0].toString(),
      );
      newAuthority.account_auths[index] = [
        newAuthority.account_auths[index][0].toString(),
        weight,
      ];
      break;
    case UPDATE_TARGET_ACCOUNT_TYPE.KEY:
      index = newAuthority.key_auths.findIndex(
        (acc) => acc[0] === props.targetAuthAccount[0].toString(),
      );
      newAuthority.key_auths[index] = [
        newAuthority.key_auths[index][0].toString(),
        weight,
      ];
      break;
  }
  switch (props.targetAuthType) {
    case UPDATE_TARGET_AUTHORITY_TYPE.ACTIVE:
      newAuthorities.active = newAuthority;
      newAuthorities.posting = undefined;
      newAuthorities.owner = undefined;
      break;

    case UPDATE_TARGET_AUTHORITY_TYPE.POSTING:
      newAuthorities.posting = newAuthority;
      break;

    default:
      newAuthorities.owner = newAuthority;
      break;
  }
  console.log('Update Weight: ', newAuthorities);
  return newAuthorities;
};

export const UpdateAuthorityWeightThresh = (
  props: IUpdateAuthorityThreshold,
  threshold: number,
): Authorities => {
  const newAuthorities: Authorities = JSON.parse(
    JSON.stringify(props.authorities),
  );
  const newAuthority: Hive.Authority = JSON.parse(
    JSON.stringify(props.targetAuthority),
  );
  newAuthority.weight_threshold = threshold;
  switch (props.targetAuthType) {
    case UPDATE_TARGET_AUTHORITY_TYPE.ACTIVE:
      newAuthorities.active = newAuthority;
      newAuthorities.posting = undefined;
      newAuthorities.owner = undefined;
      break;

    case UPDATE_TARGET_AUTHORITY_TYPE.POSTING:
      newAuthorities.posting = newAuthority;
      break;

    default:
      newAuthorities.owner = newAuthority;
      break;
  }
  return newAuthorities;
};

export const removeAccount = (
  type: string,
  username: string,
  newAccount: Authorities,
) => {
  const accountCopy = structuredClone(newAccount);

  switch (type.toLocaleLowerCase()) {
    case 'owner':
      accountCopy.owner.account_auths = accountCopy.owner.account_auths.filter(
        (account) => {
          return account[0] !== username;
        },
      );
      break;
    case 'active':
      accountCopy.active.account_auths =
        accountCopy.active.account_auths.filter((account) => {
          return account[0] !== username;
        });
      break;
    case 'posting':
      accountCopy.posting.account_auths =
        accountCopy.posting.account_auths.filter((account) => {
          return account[0] !== username;
        });
      break;
  }

  return accountCopy;
};

export const removeKey = (
  type: string,
  key: string,
  newAccount: Authorities,
) => {
  const accountCopy = structuredClone(newAccount);
  switch (type.toLocaleLowerCase()) {
    case 'owner':
      accountCopy.owner.key_auths = accountCopy.owner.key_auths.filter(
        (accountKey) => {
          return accountKey[0] !== key;
        },
      );
      break;

    case 'active':
      accountCopy.active.key_auths = accountCopy.active.key_auths.filter(
        (accountKey) => {
          return accountKey[0] !== key;
        },
      );
      break;
    case 'posting':
      accountCopy.posting.key_auths = accountCopy.posting.key_auths.filter(
        (accountKey) => {
          return accountKey[0] != key;
        },
      );
  }
  return accountCopy;
};
