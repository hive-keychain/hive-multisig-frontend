import * as Hive from '@hiveio/dhive';
import { useEffect, useState } from 'react';
import { useAppSelector } from '../../../redux/app/hooks';
import { MultisigUtils } from '../../../utils/multisig.utils';

var deepequal = require('deep-equal');

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

const useAuthorities = () => {
  const newAuthorities = useAppSelector(
    (state) => state.updateAuthorities.NewAuthorities,
  );
  const originalAuthorities = useAppSelector(
    (state) => state.updateAuthorities.Authorities,
  );

  return [originalAuthorities, newAuthorities];
};

const useAccountEditedFlag = () => {
  const [originalActive, newActive] = useActiveAuthority();
  const [accountRemoved, setAccountRemoved] = useState(false);
  const [threshEdited, setThreshEdited] = useState(false);
  const [weightUpdated, setWeightUpdated] = useState(false);
  useEffect(() => {
    if (newActive) {
      setAccountRemoved(
        originalActive.account_auths.length !== newActive.account_auths.length,
      );
      setWeightUpdated(
        !deepequal(originalActive.account_auths, newActive.account_auths, {
          strict: true,
        }) &&
          originalActive.account_auths.length ===
            newActive.account_auths.length,
      );
      setThreshEdited(
        originalActive.weight_threshold !== newActive.weight_threshold,
      );
    }
  }, [newActive]);

  return [accountRemoved, threshEdited, weightUpdated];
};

const useGranularityConfiguration = () => {
  const configuration = useAppSelector(
    (state) => state.granularity.granularity.configuration,
  );
  const newConfiguration = useAppSelector(
    (state) => state.granularity.granularity.newConfiguration,
  );

  return [configuration, newConfiguration];
};
export const MultisigGranularityHooks = {
  useActiveAuthority,
  useAddedActiveAuthority,
  useAuthorities,
  useAccountEditedFlag,
  useGranularityConfiguration,
};
