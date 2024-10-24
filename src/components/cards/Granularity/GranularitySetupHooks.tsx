import * as Hive from '@hiveio/dhive';
import { useEffect, useState } from 'react';
import { useAppSelector } from '../../../redux/app/hooks';
import { GranularityUtils } from '../../../utils/granularity-utils';
const defaultBot = process.env.GRANULARITY_BOT;
if (defaultBot === undefined) {
  console.error(
    'Default Granularity Bot is not defined in environment variables, this will cause error in 2FA setup.',
  );
}

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

const usePostingAuthority = () => {
  const newAuthorities = useAppSelector(
    (state) => state.updateAuthorities.NewAuthorities,
  );
  const originalAuthorities = useAppSelector(
    (state) => state.updateAuthorities.Authorities,
  );

  const [newPostingAuthorities, setNewPostingAuthorities] =
    useState<Hive.Authority>();
  const [originalPostingAuthorities, setOriginalPostingAuthorities] =
    useState<Hive.Authority>();

  useEffect(() => {
    if (newAuthorities) {
      setNewPostingAuthorities({ ...newAuthorities.posting });
    }
  }, [newAuthorities]);

  // Set the original posting authorities when originalAuthorities changes
  useEffect(() => {
    if (originalAuthorities) {
      setOriginalPostingAuthorities(originalAuthorities.posting);
    }
  }, [originalAuthorities]);

  return [originalPostingAuthorities, newPostingAuthorities];
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
          const res = await GranularityUtils.checkGranularityBot(
            auth[0] as string,
          );
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

const useAddedPostingAuthority = () => {
  const [originalPostingAuthorities, newPostingAuthorities] =
    usePostingAuthority(); // Assuming a hook to fetch posting authorities
  const [addedPostingAuthorities, setAddedAuthorities] = useState<
    [string, number, string][]
  >([]);

  const [latestAddedPostingAuthority, setLatestAddedPostingAuthority] =
    useState<[string, number, string]>(undefined);

  // Effect to update the latest added posting authority
  useEffect(() => {
    if (addedPostingAuthorities?.length > 0) {
      const latest = addedPostingAuthorities.slice(-1)[0];
      setLatestAddedPostingAuthority(latest);
    }
  }, [addedPostingAuthorities]);

  // Effect to compute and update added posting authorities
  useEffect(() => {
    if (newPostingAuthorities) {
      const addedAuths: [string, number, string][] = [];
      const promises = newPostingAuthorities.account_auths.map(async (auth) => {
        const index = originalPostingAuthorities.account_auths.findIndex(
          (acc) => acc[0] === auth[0],
        );
        if (index === -1) {
          const res = await GranularityUtils.checkGranularityBot(
            auth[0] as string,
          );
          addedAuths.push([auth[0], auth[1], res ? 'bot' : 'nonBot']);
        }
      });

      Promise.all(promises).then(() => {
        setAddedAuthorities(addedAuths);
      });
    }
  }, [newPostingAuthorities, originalPostingAuthorities]);

  return [addedPostingAuthorities, latestAddedPostingAuthority];
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

const useGroupedAuthorities = () => {
  const [groupedAuthorities, setGroupedAuthorities] =
    useState<Record<string, string[]>>();
  const [originalAuthorities, newAuthorities] = useAuthorities();

  useEffect(() => {
    if (newAuthorities) {
      const postingGroup = newAuthorities.posting.account_auths.map(
        ([a, w]) => {
          return { authority: a, group: 'Posting' };
        },
      );
      const activeGroup = newAuthorities.active.account_auths.map(([a, w]) => {
        return { authority: a, group: 'Active' };
      });
      const authorities = [...postingGroup, ...activeGroup].reduce<
        Record<string, string[]>
      >((groups, authority) => {
        const { group } = authority;
        if (!groups[group]) {
          groups[group] = [];
        }
        groups[group].push(authority.authority);
        return groups;
      }, {});

      setGroupedAuthorities(authorities);
    }
  }, [newAuthorities]);

  return [groupedAuthorities];
};

export const MultisigGranularityHooks = {
  useActiveAuthority,
  useAddedActiveAuthority,
  useAuthorities,
  useAccountEditedFlag,
  useGranularityConfiguration,
  useGroupedAuthorities,
  usePostingAuthority,
  useAddedPostingAuthority,
};
