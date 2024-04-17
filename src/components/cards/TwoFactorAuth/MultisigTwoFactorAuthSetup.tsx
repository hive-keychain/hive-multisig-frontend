import * as Hive from '@hiveio/dhive';
import { KeychainKeyTypes } from 'hive-keychain-commons';
import { HiveMultisig } from 'hive-multisig-sdk/src';
import { IEncodeTransaction } from 'hive-multisig-sdk/src/interfaces/socket-message-interface';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import { Authorities } from '../../../interfaces';
import {
  IExpiration,
  Initiator,
} from '../../../interfaces/transaction.interface';
import { useAppDispatch, useAppSelector } from '../../../redux/app/hooks';
import {
  resetOperation,
  setInitiator,
} from '../../../redux/features/transaction/transactionThunks';
import {
  setThresholdWarning,
  updateActive,
} from '../../../redux/features/updateAuthorities/updateAuthoritiesThunks';
import { orderAlphabetically } from '../../../utils/account-utils';
import HiveUtils from '../../../utils/hive.utils';
import HiveTxUtils from '../../../utils/hivetx.utils';
import { MultisigUtils } from '../../../utils/multisig.utils';
import { AuthorityCard } from '../Account/AuthorityCard';
var deepequal = require('deep-equal');

export const MultisigTwoFactorAuthSetup = () => {
  const [originalActive, newActive] = useActiveAuthority();
  const [thresholdWarning] = useWeightRestriction();
  const [localOriginalActive, setLocalOriginalActive] =
    useState(originalActive);

  const [multisig, setMultisig] = useState<HiveMultisig>(undefined);
  const [
    updateAuthorityState,
    activeState,
    postingState,
    isActiveKeyDeleted,
    isPostingKeyDeleted,
  ] = useAuthoritiesUpdateState();

  const originalAuthorities = useAppSelector(
    (state) => state.updateAuthorities.Authorities,
  );
  const newAuthorities = useAppSelector(
    (state) => state.updateAuthorities.NewAuthorities,
  );
  const transactionState = useAppSelector(
    (state) => state.transaction.transaction,
  );
  const signedAccountObj = useAppSelector((state) => state.login.accountObject);
  const dispatch = useAppDispatch();
  useEffect(() => {
    setMultisig(HiveMultisig.getInstance(window, MultisigUtils.getOptions()));
  }, []);
  useEffect(() => {
    if (originalActive) {
      setLocalOriginalActive(originalActive);
      handleSetInitiator();
    }
  }, [originalActive]);
  useEffect(() => {
    handleSetInitiator();
  }, [updateAuthorityState]);

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
  };

  const handleSubmit = async () => {
    if (updateAuthorityState) {
      const activeAccounts = orderAlphabetically(
        newAuthorities.active.account_auths,
      );
      const activeKeys = orderAlphabetically(newAuthorities.active.key_auths);
      const postingAccounts = orderAlphabetically(
        newAuthorities.posting.account_auths,
      );
      const postingKeys = orderAlphabetically(newAuthorities.posting.key_auths);

      const updatedAuthorities: Authorities = {
        ...newAuthorities,
        owner: undefined,
        active: {
          account_auths: activeAccounts,
          key_auths: activeKeys,
          weight_threshold: newAuthorities.active.weight_threshold,
        },
        posting: {
          account_auths: postingAccounts,
          key_auths: postingKeys,
          weight_threshold: newAuthorities.posting.weight_threshold,
        },
      };

      const keyType = KeychainKeyTypes.active;

      const op = ['account_update', updatedAuthorities];
      const transaction = await HiveTxUtils.createTx([op], {
        date: undefined,
        minutes: 60,
      } as IExpiration);

      HiveUtils.getActiveSignWeight(
        signedAccountObj.data.username,
        originalAuthorities.active,
      )
        .then((signer_weight) => {
          if (signer_weight >= originalAuthorities.active.weight_threshold) {
            HiveUtils.requestSignTx(
              transaction,
              signedAccountObj.data.username,
              keyType,
            )
              .then((signedTx) => {
                if (signedTx) {
                  HiveUtils.broadcastTx(signedTx).then(async (res) => {
                    if (res) {
                      await dispatch(resetOperation());
                      window.location.reload();
                    } else {
                      alert('Failed to broadcast');
                    }
                  });
                } else {
                  alert('[UpdateAuthConf] Signed Tx Error');
                }
              })
              .catch((e) => {
                alert(e);
              });
          } else {
            const txToEncode: IEncodeTransaction = {
              transaction: { ...transaction },
              method: keyType,
              expirationDate: moment().add(60, 'm').toDate(),
              initiator: { ...transactionState.initiator },
            };
            try {
              multisig.utils
                .encodeTransaction(txToEncode)
                .then((encodedTxObj) => {
                  multisig.wss
                    .requestSignatures(encodedTxObj)
                    .then(async () => {
                      await dispatch(resetOperation());
                      window.location.reload();
                    });
                })
                .catch((e) => {
                  alert(e.message);
                });
            } catch (error) {
              alert(`${error}`);
              window.location.reload();
            }
          }
        })
        .catch((e) => {
          alert(e);
        });
    } else {
      window.location.reload();
    }
  };

  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col md="auto" lg="7">
          <Card border="secondary">
            <Container>
              <Card.Body>
                <h3 className="card-title text-center">Multisig 2FA Setup</h3>
                <p className="justify-content-md-center">
                  {' '}
                  To complete the Two Factor Authentication setup, it is
                  required to add a multig bot account in your account
                  authorities.
                </p>

                <p>
                  You may use <strong>@hive.multisig</strong> as the bot
                  provided by Hive Keychain otherwise you may use your own
                  account configured as a bot.
                </p>

                {originalActive?.weight_threshold === 1 ? (
                  <p className="justify-content-md-center">
                    ⚠ With your current Active Authority settings, we suggest to
                    add <strong>@hive.multisig</strong> or your bot account with
                    weight of 1 and bumped the weight threshold to 2 as follows:
                  </p>
                ) : (
                  <p className="justify-content-md-center">
                    ⚠ For the 2FA to work correctly, both the user accounts,keys
                    and @hive.multisig must have a weight less than the
                    threshold. Therefore we suggest the following adjustments in
                    your active authorities:
                  </p>
                )}
                {<p>The following account/s are not bot: </p>}
                <AuthorityCard authorityName="Active" />
                <br />
                <p className="justify-content-md-center">
                  Please review the suggested modifications above. You may make
                  your own modification as you desire. Press submit to broadcast
                  the changes.
                </p>
                <div className="d-flex justify-content-end">
                  <Button
                    onClick={() => {
                      handleSubmit();
                    }}
                    className=""
                    variant="success">
                    Submit
                  </Button>
                </div>
              </Card.Body>
            </Container>
          </Card>
        </Col>
      </Row>
    </Container>
  );
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

const useHiveKeychainBotAccount = () => {
  const dispatch = useAppDispatch();
  const [originalActive, newActive] = useActiveAuthority();
  const [useKeychainBot, setUseKeychainBot] = useState(true);

  useEffect(() => {
    updateUseBot();
  }, [useKeychainBot]);

  const setUseHiveKeychainAccount = (use: boolean) => {
    setUseKeychainBot(use);
  };
  const updateUseBot = async () => {
    if (newActive) {
      let activeAuth = structuredClone(newActive);
      const found = activeAuth.account_auths.some(
        (account) => account[0] === 'hive.multisig',
      );
      console.log(`hive.multisig is ${!found ? 'NOT' : ''} FOUND`);
      if (useKeychainBot && !found) {
        activeAuth.account_auths.push(['hive.multisig', 1]);
      } else {
        activeAuth.account_auths = activeAuth.account_auths.filter(
          (acc) => acc[0] !== 'hive.multisig',
        );
      }

      await dispatch(updateActive(activeAuth));
    }
  };
  return [setUseHiveKeychainAccount];
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
    activeAuth.weight_threshold = newThreshold;
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

      if (currentThresh < totalWeight && currentThresh !== 1) {
        setThreshWarning('');
        return currentThresh;
      } else if (currentThresh === 1) {
        setThreshWarning(
          'Threshold must be greather than 1 for the 2FA to work properly.',
        );
        return currentThresh + 1;
      } else {
        setThreshWarning(
          'You may not set the threshold more than the total weight.',
        );
        return totalWeight;
      }
    }
  };

  return [thresholdWarning];
};

const useBotJSONMetadataChecker = () => {
  const [originalActive, newActive] = useActiveAuthority();
  const [nonBots, setNonBots] = useState([]);

  const handleCheck = async () => {
    const originalAccSet = new Set(
      originalActive.account_auths.map((t) => JSON.stringify(t)),
    );
    const newAccs = newActive.account_auths.filter(
      (acc) => !originalAccSet.has(JSON.stringify(acc)),
    );

    let newNonBots: [string, number][] = [];

    for (let i = 0; i < newAccs.length; i++) {
      const username = newAccs[i][0];
      const isValid = await MultisigUtils.checkMultisigBot(username);
      if (!isValid) {
        const exists = nonBots.some((t) => t[0] === username);
        if (!exists) {
          newNonBots = newNonBots.concat([newAccs[i]]);
        }
      }
    }
    setNonBots(newNonBots);
  };

  if (newActive) {
    handleCheck();
  }

  return [nonBots];
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
