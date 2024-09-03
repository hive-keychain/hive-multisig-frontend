import { useEffect, useState } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import { useAppDispatch } from '../../../../redux/app/hooks';
import { updateGranularityConfiguration } from '../../../../redux/features/granularity/granularityThunks';
import { GranularityUtils } from '../../../../utils/granularity-utils';
import { MultisigGranularityHooks } from '../GranularitySetupHooks';

interface ICustomJsonIdInput {
  authority?: string;
}
export const CustomJsonIdInput = ({ authority }: ICustomJsonIdInput) => {
  const dispatch = useAppDispatch();
  const [configuration, newConfiguration] =
    MultisigGranularityHooks.useGranularityConfiguration();
  const [inputValue, setInputValue] = useState('');
  const [updatedConfigIds, setupdatedConfigIds] = useState('');
  const [didMount, setDidMount] = useState(false); // Track if component has mounted

  // Dispatch updated config IDs after debouncing
  useEffect(() => {
    if (didMount) {
      // Only dispatch if this isn't the initial render
      const ids = updatedConfigIds.split(',');
      let configTobeUpdated = structuredClone(newConfiguration);
      configTobeUpdated = GranularityUtils.updateCustomJsonIds(
        ids,
        configTobeUpdated,
        authority,
      );
      console.log({ configTobeUpdated });
      if (configTobeUpdated) {
        dispatch(updateGranularityConfiguration(configTobeUpdated));
      }
    } else {
      setDidMount(true);
    }
  }, [updatedConfigIds]);

  // Initialize input value based on newConfiguration
  useEffect(() => {
    if (newConfiguration) {
      const ids = GranularityUtils.getCustomJsonIds(
        newConfiguration,
        authority,
      );
      if (ids && ids.length >= 0) {
        setInputValue(ids.join(','));
      }
    }
  }, [newConfiguration]);

  // Debouncing input changes
  useEffect(() => {
    const handler = setTimeout(() => {
      setupdatedConfigIds(inputValue);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [inputValue]);

  const handleInputOnChange = (value: string) => {
    setInputValue(value);
  };

  return (
    <div>
      <InputGroup>
        <InputGroup.Text>ID</InputGroup.Text>
        <Form.Control
          aria-label="Small"
          aria-describedby="inputGroup-sizing-sm"
          className={`form-control`}
          value={inputValue}
          placeholder={'Comma separated IDs'}
          onChange={(e) => handleInputOnChange(e.target.value)}
        />
      </InputGroup>
    </div>
  );
};
