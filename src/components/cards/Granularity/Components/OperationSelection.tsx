import { useEffect, useState } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import {
  Operation,
  OperationName,
} from '../../../../interfaces/granularity.interface';
import { useAppDispatch } from '../../../../redux/app/hooks';
import { updateGranularityConfiguration } from '../../../../redux/features/granularity/granularityThunks';
import { GranularityUtils } from '../../../../utils/granularity-utils';
import { capitalizeOpFirstLetter } from '../../../../utils/utils';
import { MultisigGranularityHooks } from '../GranularitySetupHooks';

const GBOT_CONFIG_ID = process.env.GBOT_CONFIG_ID;
interface IOperationSelection {
  authority?: string;
}
export const OperationSelection = ({ authority }: IOperationSelection) => {
  const operations = Object.entries(OperationName).map(([key, value]) => ({
    key,
    displayName: value
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' '),
  }));

  const [addedOps, setAddedOps] = useState<string[]>([]);
  const [selectedOp, setSelectedOp] = useState('All');
  const [opTobeAdded, setOpToBeAdded] = useState<Operation>({
    operationName: 'all',
  });

  const [options, setOptions] = useState([]);
  const dispatch = useAppDispatch();
  const [configuration, newConfiguration] =
    MultisigGranularityHooks.useGranularityConfiguration();

  // set the current selected operation
  useEffect(() => {
    setSelectedOp(selectedOp);
  }, [selectedOp]);

  // update the local list of added operations
  useEffect(() => {
    if (newConfiguration) {
      const ops = GranularityUtils.getOperationNames(
        newConfiguration,
        authority,
      );
      setAddedOps([...ops]);
    }
  }, [newConfiguration]);

  // create the options
  useEffect(() => {
    const selectOptions = operations.map((operation) => {
      const key = OperationName[operation.key as keyof typeof OperationName];
      const isAdded = addedOps.includes('all') || addedOps.includes(key);

      return (
        <option
          key={operation.key}
          value={operation.key}
          style={{
            backgroundColor: isAdded ? '#d3d3d3' : 'white',
          }}>
          {operation.displayName}
        </option>
      );
    });

    setOptions(selectOptions);
  }, [addedOps]);

  const handleAdd = () => {
    if (addedOps.includes('all')) {
      alert(`All operations is already adedd`);
    } else if (!addedOps.includes(opTobeAdded.operationName)) {
      const updatedConfiguration = structuredClone(newConfiguration);
      let newConfig = undefined;
      if (authority) {
        //Add to specific authority
        newConfig = GranularityUtils.addOpToAuthority(
          authority,
          opTobeAdded,
          updatedConfiguration,
        );
      } else {
        // Add to all users
        newConfig = GranularityUtils.addAllUserOp(
          opTobeAdded,
          updatedConfiguration,
        );
      }

      if (newConfig) {
        dispatch(updateGranularityConfiguration(newConfig));
        console.log({ opTobeAdded });
      }
    } else {
      alert(`${capitalizeOpFirstLetter(selectedOp)} is already added`);
    }
  };

  const generateOpToBeAdded = (op: string): Operation => {
    const operationName = OperationName[op as keyof typeof OperationName];
    if (operationName === OperationName.CHANGE_CONFIG) {
      return {
        operationName: OperationName.CHANGE_CONFIG,
        id: [GBOT_CONFIG_ID],
      };
    }
    return {
      operationName,
    };
  };
  const handleSelectionChange = (op: string) => {
    const toBeAdded = generateOpToBeAdded(op);
    setOpToBeAdded(toBeAdded);
    setSelectedOp(op);
  };

  return (
    <>
      <Form.Label>Select Operation</Form.Label>
      <InputGroup>
        <Form.Select
          value={selectedOp}
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
