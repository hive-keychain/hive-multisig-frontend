import { useEffect, useState } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { useAppDispatch } from '../../../../redux/app/hooks';
import { updateGranularityConfiguration } from '../../../../redux/features/granularity/granularityThunks';
import { GranularityUtils } from '../../../../utils/granularity-utils';
import { MultisigGranularityHooks } from '../GranularitySetupHooks';

export const AuthoritySelection = () => {
  const dispatch = useAppDispatch();
  const [configuration, newConfiguration] =
    MultisigGranularityHooks.useGranularityConfiguration();
  const [options, setOptions] = useState([]);
  const [addedAuthorities, setAddedAuthorities] = useState([]);
  const [groupedAuthorities] = MultisigGranularityHooks.useGroupedAuthorities();
  const [selectedAuthority, setSelectedAuthority] = useState<string>();
  useEffect(() => {
    if (groupedAuthorities && newConfiguration) {
      const allElements = Object.values(groupedAuthorities).reduce(
        (acc, curr) => acc.concat(curr),
        [],
      );

      const auths = [...new Set(allElements)];
      console.log({ auths });

      let firstOptionKey: string = null; // Variable to store the first option's key
      const addedAuths =
        GranularityUtils.getAuthorityNameList(newConfiguration);
      // const opts = Object.keys(groupedAuthorities).map((group) => {
      //   const options = groupedAuthorities[group].map((authority, index) => {
      //     const isAdded = addedAuths.includes(authority);
      //     const optionElement = (
      //       <option
      //         key={authority}
      //         value={authority}
      //         style={{
      //           backgroundColor: isAdded ? '#d3d3d3' : 'white',
      //         }}>
      //         {authority}
      //       </option>
      //     );
      //     if (firstOptionKey === null && index === 0) {
      //       firstOptionKey = authority;
      //     }
      //     return optionElement;
      //   });

      //   return (
      //     <optgroup key={group} label={`${group} Authorities`}>
      //       {options}
      //     </optgroup>
      //   );
      // });

      const options = auths.map((authority, index) => {
        const isAdded = addedAuths.includes(authority);
        const optionElement = (
          <option
            key={authority}
            value={authority}
            style={{
              backgroundColor: isAdded ? '#d3d3d3' : 'white',
            }}>
            {authority}
          </option>
        );
        if (firstOptionKey === null && index === 0) {
          firstOptionKey = authority;
        }
        return optionElement;
      });
      setAddedAuthorities(addedAuths);
      setOptions(options);
      setSelectedAuthority(firstOptionKey);
    }
  }, [groupedAuthorities, newConfiguration]);

  const handleAdd = () => {
    if (!addedAuthorities.includes(selectedAuthority)) {
      const updatedConfiguration = structuredClone(newConfiguration);
      const newConfig = GranularityUtils.addAuthority(
        selectedAuthority,
        updatedConfiguration,
      );
      if (newConfig) {
        dispatch(updateGranularityConfiguration(newConfig));
      }
    } else {
      alert(`@${selectedAuthority} is already added.`);
    }
  };
  const handleSelectionChange = (authority: string) => {
    setSelectedAuthority(authority);
  };

  return (
    <>
      <Form.Label>Select Authority</Form.Label>
      <InputGroup>
        <Form.Select
          value={selectedAuthority}
          onChange={(e) => handleSelectionChange(e.target.value)}>
          {options}
        </Form.Select>
        <Button
          variant="outline-primary"
          onClick={() => {
            handleAdd();
          }}>
          {' '}
          Add
        </Button>
      </InputGroup>
    </>
  );
};
