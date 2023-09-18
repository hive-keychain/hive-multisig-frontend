import { FC, useEffect, useState } from "react";
import { Card, Container, Stack } from "react-bootstrap";
import { IAccountKeyRowProps, IAccountKeysCardProps, IAuthorityCardProps } from "../../../interfaces/cardInterfaces";
import { castToString } from '../../../utils/utils';
import { AuthorityWeightThreshold } from '../Account/AuthorityWeightThresholdRow';
import { SearchAccountKeysCard } from "./SearchAccountKeysCard";


export const SearchAuthorityCard: FC<IAuthorityCardProps> = ({authorityName, authority}) =>{
  const[accounts, setAccounts] = useState<IAccountKeysCardProps>({
    authorityName: authorityName,
    authAccountType: 'Accounts',
    accountKeyAuths: authority.account_auths,
    })
  const[keys, setKeys] = useState<IAccountKeysCardProps>(
    {
        authorityName: authorityName,
        authAccountType: 'Keys',
        accountKeyAuths: authority.key_auths.map((e) => {
            return [castToString(e[0]),e[1]]
           })
    }
    )
    const[thresh, setThresh] = useState<IAccountKeyRowProps>({
        type: 'threshold',
        authorityName: authorityName,
        threshold: authority.weight_threshold,
    });
  useEffect(()=>{
    if(authority){
        setAccounts(
            {
                authorityName: authorityName,
                authAccountType: 'Accounts',
                accountKeyAuths: authority.account_auths,
            }
        )
        setKeys( {
            authorityName: authorityName,
            authAccountType: 'Keys',
            accountKeyAuths: authority.key_auths.map((e) => {
                return [castToString(e[0]),e[1]];
               })
          });
        setThresh(
        {
            type: 'threshold',
            authorityName: authorityName,
            threshold: authority.weight_threshold,
        }
        );
    }
  },[authority])
    
  
 return (
    <Card>
      <Container>
        <Card.Body>
          <Card.Title>{authorityName}</Card.Title>
          <Stack gap={2}>
            {
              accounts.accountKeyAuths.length>0?
              <SearchAccountKeysCard
              authorityName={authorityName}
              authAccountType={accounts.authAccountType}
              accountKeyAuths={accounts.accountKeyAuths}
            />:''
            }
            {
              keys.accountKeyAuths.length>0?
              <SearchAccountKeysCard
              authorityName={authorityName}
              authAccountType={keys.authAccountType}
              accountKeyAuths={keys.accountKeyAuths}
            />:''
            }
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