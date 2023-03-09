import { FC, ReactNode, useEffect, useState } from "react";
import { Card, Container, Stack } from "react-bootstrap";
import { IAccountKeysCardProps } from "../../../interfaces/cardInterfaces";
import { SearchAccountKeyRow } from "./SearchAccountKeyRow";

export const SearchAccountKeysCard: FC<IAccountKeysCardProps> = ({authorityName,
    authAccountType,
    accountKeyAuths})=>{
    const [accountComponentList, setAccountComponentList] = useState<[string,ReactNode][]>(
        accountKeyAuths.map(
            (accountKeyAuth):[string,ReactNode] =>
            { return [accountKeyAuth[0], <SearchAccountKeyRow
                key={accountKeyAuth[0].toString()}
                authorityName = {authorityName}
                type={authAccountType}
                accountKeyAuth={accountKeyAuth} 
                />]}
            )
        );
    useEffect(()=>{
      setAccountComponentList(
        accountKeyAuths.map(
          (accountKeyAuth):[string,ReactNode] =>
          { return [accountKeyAuth[0], <SearchAccountKeyRow
              key={accountKeyAuth[0].toString()}
              authorityName = {authorityName}
              type={authAccountType}
              accountKeyAuth={accountKeyAuth} 
              />]}
          )
      )
      console.log("accountComponentList",accountComponentList);
    },[accountKeyAuths])
        return (
            <Card border={'secondary'}>
              <Container>
                <Card.Body>
                  <Card.Title>{authAccountType}</Card.Title>
                  <Stack gap={2}>
                    {accountComponentList?accountComponentList.map((component) => {return component[1]}):<div></div>}
                  </Stack>
                </Card.Body>
              </Container>
            </Card>
          );
}