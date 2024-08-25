import { useEffect, useState } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { useAppSelector } from '../../../redux/app/hooks';
import { MultisigGranularityHooks } from './GranularitySetupHooks';

export const AuthoritySelection = () => {
  const [originalAuthorities, newAuthorities] =
    MultisigGranularityHooks.useAuthorities();
  const [selection, setSelection] = useState<string[]>([]);

  const configuration = useAppSelector(
    (state) => state.granularity.granularity.configuration,
  );

  useEffect(() => {
    if (newAuthorities) {
      const authorities = newAuthorities.active.account_auths
        .map((auth) => auth[0]) // Return the auth[0] value
        .filter(
          (auth: string) => auth !== undefined && !isAuthorityInConfig(auth),
        );
      setSelection(authorities);
    }
  }, [configuration, newAuthorities]);

  const isAuthorityInConfig = (authority: string) => {
    return configuration.json.configurations.some(
      (config) => config.authority === authority,
    );
  };

  return (
    <>
      <Form.Label>Select Authority</Form.Label>
      <InputGroup>
        <Form.Select>
          {selection.map((authority, index) => (
            <option key={index} value={authority}>
              @{authority}
            </option>
          ))}
        </Form.Select>
        <Button variant="outline-primary"> Add</Button>
      </InputGroup>
    </>
  );
};
