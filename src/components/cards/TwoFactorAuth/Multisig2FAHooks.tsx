import * as Hive from '@hiveio/dhive';
import { useEffect, useState } from 'react';
import { Initiator } from '../../../interfaces/transaction.interface';
import { useAppDispatch, useAppSelector } from '../../../redux/app/hooks';
import { setInitiator } from '../../../redux/features/transaction/transactionThunks';
import {
  setThresholdWarning,
  updateActive,
} from '../../../redux/features/updateAuthorities/updateAuthoritiesThunks';
var deepequal = require('deep-equal');
const defaultBot = process.env.BOT;

const useActiveAuthority = () => {
  const newAuthorities = useAppSelector(
    (state) => state.updateAuthorities.NewAuthorities,
  );
  const originalAuthorities = useAppSelector(
    (state) => state.updateAuthorities.Authorities,
  );
  const [newActiveAuthorities, setNewActiveAuthorities] =
    useState<Hive.Authority>();
  const [originalActiveAuthorities, setOriginalActiveAuthorities] =
    useState<Hive.Authority>();

  useEffect(() => {
    if (newAuthorities) {
      setNewActiveAuthorities({ ...newAuthorities.active });
    }
  }, [newAuthorities]);

  useEffect(() => {
    if (originalAuthorities) {
      setOriginalActiveAuthorities(originalAuthorities.active);
    }
  }, [originalAuthorities]);

  return [originalActiveAuthorities, newActiveAuthorities];
};

const useWeightRestriction = () => {
  const dispatch = useAppDispatch();
  const [thresholdWarning, setThreshWarning] = useState('');
  const [originalActive, newActive] = useActiveAuthority();
  const [localUpdatedActive, setLocalUpdatedActive] =
    useState<Hive.Authority>(newActive);
  useEffect(() => {
    if (newActive) {
      if (!deepequal(localUpdatedActive, newActive, { strict: true }))
        handleRestriction();
    }
  }, [newActive]);

  useEffect(() => {
    dispatch(setThresholdWarning(thresholdWarning));
  }, [thresholdWarning]);

  const handleRestriction = async () => {
    let activeAuth = structuredClone(newActive);
    const newAccounts = suggestNewActiveAccountConfig(activeAuth);
    const newKeys = suggesetNewActiveKeysConfig(activeAuth);
    activeAuth.account_auths = [...newAccounts];
    activeAuth.key_auths = [...newKeys];

    const newThreshold = suggestNewThreshold(activeAuth);
    // activeAuth.weight_threshold = newThreshold;
    await dispatch(updateActive(activeAuth));
    setLocalUpdatedActive(activeAuth);
  };

  const suggestNewActiveAccountConfig = (
    activeAuthority: Hive.AuthorityType,
  ) => {
    if (activeAuthority) {
      const currentThresh = activeAuthority.weight_threshold;
      const accountesLessThanThresh = activeAuthority.account_auths.filter(
        (account) => account[1] < currentThresh,
      );

      const accountsEqualGreaterThanThresh =
        activeAuthority.account_auths.filter(
          (account) => account[1] >= currentThresh,
        );
      let newAccounts = [...accountesLessThanThresh];
      const suggestedWeights: [string, number][] =
        accountsEqualGreaterThanThresh.map((account) => {
          return [account[0], Math.max(currentThresh - 1, 1)];
        });
      newAccounts.push(...suggestedWeights);

      return newAccounts;
    }
  };

  const suggesetNewActiveKeysConfig = (activeAuthority: Hive.AuthorityType) => {
    if (activeAuthority) {
      const currentThresh = activeAuthority.weight_threshold;
      const keysLessThanThresh = activeAuthority.key_auths.filter(
        (key) => key[1] < currentThresh,
      );
      const keysEqualGreaterThanThresh = activeAuthority.key_auths.filter(
        (key) => key[1] >= currentThresh,
      );

      let newKeys = [...keysLessThanThresh];

      const suggestedWeights: [string | Hive.PublicKey, number][] =
        keysEqualGreaterThanThresh.map((key) => {
          return [key[0], Math.max(currentThresh - 1, 1)];
        });

      newKeys.push(...suggestedWeights);

      return newKeys;
    }
  };

  const suggestNewThreshold = (activeAuthority: Hive.AuthorityType) => {
    if (activeAuthority) {
      const currentThresh = activeAuthority.weight_threshold;

      const totalActiveWeight = activeAuthority.account_auths.reduce(
        (total, account) => total + account[1],
        0,
      );
      const totalKeyWeight = activeAuthority.key_auths.reduce(
        (total, key) => total + key[1],
        0,
      );

      const totalWeight = totalActiveWeight + totalKeyWeight;

      if (currentThresh === 1) {
        setThreshWarning(
          `Threshold must be greather than 1 or atleast ${
            currentThresh + 1
          } for the 2FA to work properly.`,
        );
        return currentThresh + 1;
      } else if (currentThresh === totalWeight) {
        setThreshWarning(
          `Threshold must be at least ${
            totalWeight - 1
          } for the 2FA to work properly.`,
        );
        return totalWeight - 1;
      } else if (currentThresh > totalWeight) {
        setThreshWarning(
          'You may not set the threshold more than the total weight. ' +
            `Try increasing the weight of your authorities or decrease the weight threshold less than or equal to the total weights (${totalWeight})`,
        );
        return totalWeight;
      } else {
        //(currentThresh < totalWeight && currentThresh !== 1)
        setThreshWarning('');
        return currentThresh;
      }
    }
  };

  return [thresholdWarning];
};

const useAuthoritiesUpdateState = () => {
  const isPostingAuthUpdated = useAppSelector(
    (state) => state.updateAuthorities.isPostingAuthUpdated,
  );
  const isActiveAuthUpdated = useAppSelector(
    (state) => state.updateAuthorities.isActiveAuthUpdated,
  );

  const isActiveKeyDeleted = useAppSelector(
    (state) => state.updateAuthorities.isActiveKeyDeleted,
  );
  const isPostingKeyDeleted = useAppSelector(
    (state) => state.updateAuthorities.isPostingKeyDeleted,
  );

  return [
    isActiveAuthUpdated || isPostingAuthUpdated,
    isActiveAuthUpdated,
    isPostingAuthUpdated,
    isActiveKeyDeleted,
    isPostingKeyDeleted,
  ];
};

const useMultisigInitiatorHandler = () => {
  const [
    updateAuthorityState,
    activeState,
    postingState,
    isActiveKeyDeleted,
    isPostingKeyDeleted,
  ] = useAuthoritiesUpdateState();
  const [originalActive, newActive] = useActiveAuthority();
  const [multisigInitiator, setMultisigInitiator] = useState(undefined);
  const originalAuthorities = useAppSelector(
    (state) => state.updateAuthorities.Authorities,
  );
  const newAuthorities = useAppSelector(
    (state) => state.updateAuthorities.NewAuthorities,
  );
  const signedAccountObj = useAppSelector((state) => state.login.accountObject);
  const dispatch = useAppDispatch();

  useEffect(() => {
    handleSetInitiator();
  }, [updateAuthorityState, originalActive]);

  const handleSetInitiator = async () => {
    let initiator: Initiator;
    const active_auth =
      JSON.stringify(newAuthorities.active) ===
        JSON.stringify(originalAuthorities.active) && !isActiveKeyDeleted
        ? originalAuthorities.active.key_auths[0]
        : !isActiveKeyDeleted
        ? originalAuthorities.active.key_auths[0]
        : newAuthorities.active.key_auths[0];
    initiator = {
      username: signedAccountObj.data.username,
      publicKey: active_auth[0].toString(),
      weight: active_auth[1],
    };
    await dispatch(setInitiator(initiator));
    setMultisigInitiator(initiator);
  };

  return [multisigInitiator];
};

export const MultisigTwoFAHooks = {
  useActiveAuthority,
  useWeightRestriction,
  useMultisigInitiatorHandler,
};
