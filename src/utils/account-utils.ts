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
