import * as Hive from '@hiveio/dhive';
import { useEffect, useState } from 'react';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../../../redux/app/hooks';
import {
  setThresholdWarning,
  updateActive,
} from '../../../redux/features/updateAuthorities/updateAuthoritiesThunks';
import { AuthorityCard } from '../Account/AuthorityCard';
var deepequal = require('deep-equal');

export const MultisigTwoFactorAuthSetup = () => {
  const [originalActive, newActive] = useActiveAuthority();
  const [_, thresholdWarning] = useSuggestedActiveAuthority();
  const [localOriginalActive, setLocalOriginalActive] =
    useState(originalActive);
  useEffect(() => {
    if (originalActive) {
      setLocalOriginalActive(originalActive);
    }
  }, [originalActive]);
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
                  required to add @hive.multisig in your account authorities.
                </p>

                {originalActive?.weight_threshold === 1 ? (
                  <p className="justify-content-md-center">
                    ⚠ With your current Active Authority settings, we suggest to
                    add @hive.multisig with weight of 1 and bumped the weight
                    threshold to 2 as follows:
                  </p>
                ) : (
                  <p className="justify-content-md-center">
                    ⚠ For the 2FA to work correctly, both the user accounts,keys
                    and @hive.multisig must have a weight less than the
                    threshold. Therefore we suggest the following adjustments in
                    your active authorities:
                  </p>
                )}

                <AuthorityCard authorityName="Active" />
                <br />
                <p className="justify-content-md-center">
                  Please review the suggested modifications above. You may make
                  your own modification as you desire. Press submit to broadcast
                  the changes.
                </p>
                <div className="d-flex justify-content-end">
                  <Button onClick={() => {}} className="" variant="success">
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

const useSuggestedActiveAuthority = () => {
  const dispatch = useAppDispatch();
  const [originalActive, newActive] = useActiveAuthority();
  const [thresholdWarning, setThreshWarning] = useState('');
  const [localUpdatedActive, setLocalUpdatedActive] =
    useState<Hive.Authority>(newActive);

  useEffect(() => {
    if (newActive) {
      if (!deepequal(localUpdatedActive, newActive, { strict: true })) {
        updateSuggested();
      }
    }
  }, [newActive]);

  useEffect(() => {
    dispatch(setThresholdWarning(thresholdWarning));
  }, [thresholdWarning]);
  const updateSuggested = async () => {
    if (newActive) {
      let activeAuth = structuredClone(newActive);
      const found = activeAuth.account_auths.some(
        (account) => account[0] === 'hive.multisig',
      );
      if (!found) {
        activeAuth.account_auths.push(['hive.multisig', 1]);
        /**Enable these lines if you want to automatically suggest the weights to 1 */
        const newAccounts = suggestNewActiveAccountConfig(activeAuth);
        const newKeys = suggesetNewActiveKeysConfig(activeAuth);
        activeAuth.account_auths = [...newAccounts];
        activeAuth.key_auths = [...newKeys];
      }

      const newThreshold = suggestNewThreshold(activeAuth);
      activeAuth.weight_threshold = newThreshold;
      await dispatch(updateActive(activeAuth));
      setLocalUpdatedActive(activeAuth);
    }
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

  return [newActive, thresholdWarning];
};
