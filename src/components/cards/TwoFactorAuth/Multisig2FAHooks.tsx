import * as Hive from '@hiveio/dhive';
import { useEffect, useState } from 'react';
import { Initiator } from '../../../interfaces/transaction.interface';
import { useAppDispatch, useAppSelector } from '../../../redux/app/hooks';
import { setInitiator } from '../../../redux/features/transaction/transactionThunks';
import { setThresholdWarning } from '../../../redux/features/updateAuthorities/updateAuthoritiesThunks';
import { MultisigUtils } from '../../../utils/multisig.utils';
var deepequal = require('deep-equal');
const defaultBot = process.env.BOT;

const useAddedActiveAuthority = () => {
  const [originalActiveAuthorities, newActiveAuthorities] =
    useActiveAuthority();
  const [addedActiveAuthorities, setAddedAuthorities] = useState<
    [string, number, string][]
  >([]);

  const [latestAddedActiveAuthority, setLatestAddedActiveAuthority] =
    useState<[string, number, string]>(undefined);

  useEffect(() => {
    if (addedActiveAuthorities?.length > 0) {
      const latest = addedActiveAuthorities.slice(-1)[0];
      const latestAdded = latestAddedActiveAuthority
        ? latestAddedActiveAuthority[0]
        : '';
      setLatestAddedActiveAuthority(latest);
    }
  }, [addedActiveAuthorities]);
  useEffect(() => {
    if (newActiveAuthorities) {
      const addedAuths: [string, number, string][] = [];
      const promises = newActiveAuthorities.account_auths.map(async (auth) => {
        const index = originalActiveAuthorities.account_auths.findIndex(
          (acc) => acc[0] === auth[0],
        );
        if (index === -1) {
          const res = await MultisigUtils.checkMultisigBot(auth[0] as string);
          addedAuths.push([auth[0], auth[1], res ? 'bot' : 'nonBot']);
        }
      });

      Promise.all(promises).then(() => {
        setAddedAuthorities(addedAuths);
      });
    }
  }, [newActiveAuthorities, originalActiveAuthorities]);

  return [addedActiveAuthorities, latestAddedActiveAuthority];
};
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
    const newThreshold = suggestNewThreshold(activeAuth);
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
          `Threshold must be at least ${
            currentThresh + 1
          } for the 2FA to work properly.`,
        );
        return currentThresh + 1;
      } else if (currentThresh > totalWeight) {
        setThreshWarning(
          'You may not set a threshold bigger than the sum of the authority weights. ' +
            `Please increase the weights of your authorities or decrease the threshold to ${totalWeight}`,
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

const useAccountEditedFlag = () => {
  const [originalActive, newActive] = MultisigTwoFAHooks.useActiveAuthority();
  const [edited, setEdited] = useState(false);
  useEffect(() => {
    if (newActive) {
      if (!deepequal(originalActive, newActive, { strict: true })) {
        setEdited(true);
      } else {
        setEdited(false);
      }
    }
  }, [newActive]);
  return [edited];
};
export const MultisigTwoFAHooks = {
  useActiveAuthority,
  useWeightRestriction,
  useMultisigInitiatorHandler,
  useAccountEditedFlag,
  useAddedActiveAuthority,
};
