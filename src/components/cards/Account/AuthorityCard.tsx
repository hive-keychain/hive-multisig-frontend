import * as Hive from '@hiveio/dhive';
import { useEffect, useState } from 'react';
import { Card, Container, Stack } from 'react-bootstrap';
import {
  IAccountKeyRowProps,
  IAccountKeysCardProps,
} from '../../../interfaces/cardInterfaces';

import { useAppSelector } from '../../../redux/app/hooks';
import { AccountKeysCard } from './AccountKeysCard';
import { AuthorityWeightThreshold } from './AuthorityWeightThresholdRow';

interface IAuthoritiCardProp {
  authorityName: string;
}
export function AuthorityCard({ authorityName }: IAuthoritiCardProp) {
  const [accounts, setAccounts] = useState<IAccountKeysCardProps>(undefined);
  const [keys, setKeys] = useState<IAccountKeysCardProps>(undefined);
  const [thresh, setThresh] = useState<IAccountKeyRowProps>(undefined);
  const [authority, setAuthority] = useState<Hive.AuthorityType>();
  const newAuthorities = useAppSelector(
    (state) => state.updateAuthorities.NewAuthorities,
  );

  useEffect(() => {
    if (newAuthorities) {
      switch (authorityName.toLowerCase()) {
        case 'owner':
          setAuthority(newAuthorities.owner);
          break;
        case 'active':
          setAuthority(newAuthorities.active);
          break;
        case 'posting':
          setAuthority(newAuthorities.posting);
          break;
      }
    }
  }, [newAuthorities]);

  useEffect(() => {
    if (authority) {
      handleAccountsChange();
      handleKeysChange();
      handleThreshChange();
    }
  }, [authority]);

  const handleAccountsChange = () => {
    const newAccounts: IAccountKeysCardProps = {
      authorityName: authorityName,
      authAccountType: 'Accounts',
      accountKeyAuths: authority.account_auths,
    };

    setAccounts(newAccounts);
  };

  const handleKeysChange = () => {
    let keyAuths: [string, number][] = [];
    const castToString = ([k, w]: [string | Hive.PublicKey, number]) => {
      keyAuths.push([k.toString(), w]);
    };
    authority.key_auths.forEach((e) => {
      castToString(e);
    });
    const newKeys: IAccountKeysCardProps = {
      authorityName: authorityName,
      authAccountType: 'Keys',
      accountKeyAuths: keyAuths,
    };

    setKeys(newKeys);
  };

  const handleThreshChange = () => {
    const newThresh: IAccountKeyRowProps = {
      type: 'threshold',
      authorityName: authorityName,
      threshold: authority.weight_threshold,
    };
    setThresh(newThresh);
  };

  return (
    <Card>
      <Container>
        <Card.Body>
          <Card.Title>{authorityName + ' Authorities'}</Card.Title>
          {authority ? (
            <Stack gap={2}>
              {accounts ? (
                <AccountKeysCard
                  authorityName={authorityName}
                  authAccountType={accounts.authAccountType}
                  accountKeyAuths={accounts.accountKeyAuths}
                />
              ) : (
                ''
              )}
              {keys ? (
                <AccountKeysCard
                  authorityName={authorityName}
                  authAccountType={keys.authAccountType}
                  accountKeyAuths={keys.accountKeyAuths}
                />
              ) : (
                ''
              )}

              {thresh ? (
                <AuthorityWeightThreshold
                  type={thresh.type}
                  authorityName={thresh.authorityName}
                  threshold={thresh.threshold}
                />
              ) : (
                ''
              )}
            </Stack>
          ) : (
            ''
          )}
        </Card.Body>
      </Container>
    </Card>
  );
}
