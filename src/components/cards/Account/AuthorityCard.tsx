import * as Hive from '@hiveio/dhive';
import {
  Card,
  Container,
  Stack
} from 'react-bootstrap';
import { IAccountKeyRowProps, IAccountKeysCardProps, IAuthorityCardProps } from '../interfaces';
import { AccountKeysCard } from './AccountKeysCard';
import { AuthorityWeightThreshold } from './AuthorityWeightThresholdRow';


export function AuthorityCard({authorityName, authority}: IAuthorityCardProps) {
 
  const accounts: IAccountKeysCardProps = {
    authorityName: authorityName,
    authAccountType: 'Accounts',
    accountKeyAuths: authority.account_auths,
  };
  let keyAuths: [string, number][] = [];
  const castToString = ([k, w]: [string | Hive.PublicKey, number]) => {
    keyAuths.push([k.toString(), w]);
  };
  authority.key_auths.forEach((e) => {
    castToString(e);
  });
  const keys: IAccountKeysCardProps = {
    authorityName: authorityName,
    authAccountType: 'Keys',
    accountKeyAuths: keyAuths,
  };
  const thresh: IAccountKeyRowProps = {
    type: 'threshold',
    authorityName: authorityName,
    threshold: authority.weight_threshold,
  };
  return (
    <Card>
      <Container>
        <Card.Body>
          <Card.Title>{authorityName}</Card.Title>
          <Stack gap={2}>
            <AccountKeysCard
              authorityName={authorityName}
              authAccountType={accounts.authAccountType}
              accountKeyAuths={accounts.accountKeyAuths}
            />
            <AccountKeysCard
              authorityName={authorityName}
              authAccountType={keys.authAccountType}
              accountKeyAuths={keys.accountKeyAuths}
            />
            <AuthorityWeightThreshold
              type={thresh.type}
              authorityName={thresh.authorityName}
              threshold={thresh.threshold}
            />
          </Stack>
        </Card.Body>
      </Container>
    </Card>
  );
}
