import { useEffect, useState } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import {
  ActiveOperationName,
  CommonOperationName,
  Operation,
  OperationName,
  PostingOperationName,
} from '../../../../interfaces/granularity.interface';
import { useAppDispatch } from '../../../../redux/app/hooks';
import { updateGranularityConfiguration } from '../../../../redux/features/granularity/granularityThunks';
import { GranularityUtils } from '../../../../utils/granularity-utils';
import { capitalizeOpFirstLetter } from '../../../../utils/utils';
import { MultisigGranularityHooks } from '../GranularitySetupHooks';

const GBOT_CONFIG_ID = process.env.GBOT_CONFIG_ID;
const defaultBot = process.env.GRANULARITY_BOT;

interface IOperationSelection {
  authority?: string;
}
export const OperationSelection = ({ authority }: IOperationSelection) => {
  const [operationsOptions, setOperationsOptions] = useState([]);
  const [activeOptions, setActiveOptions] = useState([]);
  const [postingOptions, setPostingOptions] = useState([]);
  const [commonOptions, setCommonOptions] = useState([]);
  const [isActiveAuth, isPostingAuth] =
    MultisigGranularityHooks.useWhichAuthority(authority);
  const [isBotActiveAuth, isBotPostingAuth] =
    MultisigGranularityHooks.useWhichAuthority(defaultBot);
  const [addedOps, setAddedOps] = useState<string[]>([]);
  const [selectedOp, setSelectedOp] = useState('All');
  const [opTobeAdded, setOpToBeAdded] = useState<Operation>({
    operationName: 'all',
  });
  const [configuration, newConfiguration] =
    MultisigGranularityHooks.useGranularityConfiguration();
  const dispatch = useAppDispatch();

  useEffect(() => {
    let firstOptionKey: string = null;
    let opSelected: string = null;

    const commonOps = Object.entries(CommonOperationName).map(
      ([key, value], index) => {
        const isAdded = addedOps.includes(value);
        const displayName = value
          .split('_')
          .map(
            (word) =>
              word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
          )
          .join(' ');
        const element = (
          <option
            key={key}
            value={key}
            style={{
              backgroundColor: isAdded ? '#d3d3d3' : 'white',
            }}>
            {displayName}
          </option>
        );
        if (firstOptionKey === null && index === 0) {
          firstOptionKey = value;
          opSelected = displayName;
        }

        return element;
      },
    );

    setCommonOptions(commonOps);

    if (isActiveAuth && isBotActiveAuth) {
      const activeOps = Object.entries(ActiveOperationName).map(
        ([key, value], index) => {
          const isAdded = addedOps.includes(value);
          const displayName = value
            .split('_')
            .map(
              (word) =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
            )
            .join(' ');
          const element = (
            <option
              key={key}
              value={key}
              style={{
                backgroundColor: isAdded ? '#d3d3d3' : 'white',
              }}>
              {displayName}
            </option>
          );
          if (firstOptionKey === null && index === 0) {
            firstOptionKey = value;
            opSelected = displayName;
          }

          return element;
        },
      );

      setActiveOptions(activeOps);
    }

    if (isPostingAuth && isBotPostingAuth) {
      console.log({ addedOps });

      const postingOps = Object.entries(PostingOperationName).map(
        ([key, value], index) => {
          const isAdded = addedOps.includes(value);

          const displayName = value
            .split('_')
            .map(
              (word) =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
            )
            .join(' ');
          const element = (
            <option
              key={key}
              value={key}
              style={{
                backgroundColor: isAdded ? '#d3d3d3' : 'white',
              }}>
              {displayName}
            </option>
          );

          if (firstOptionKey === null && index === 0) {
            firstOptionKey = value;
            opSelected = displayName;
          }

          return element;
        },
      );

      setPostingOptions(postingOps);
    }

    setOpToBeAdded({ operationName: 'all' });
    setSelectedOp('All');
  }, [isActiveAuth, isPostingAuth, newConfiguration, addedOps]);

  useEffect(() => {
    var activeOptsGroup;
    var postingOptsGroup;
    var commonOptsGroup;

    if (isActiveAuth && activeOptions && activeOptions.length > 0) {
      activeOptsGroup = (
        <optgroup key={'active'} label={`Active Operations`}>
          {activeOptions}
        </optgroup>
      );
    }

    if (isPostingAuth && postingOptions && postingOptions.length > 0) {
      postingOptsGroup = (
        <optgroup key={'posting'} label={`Posting Operations`}>
          {postingOptions}
        </optgroup>
      );
    }

    if (commonOptions && commonOptions.length > 0) {
      commonOptsGroup = (
        <optgroup key={'common'} label={`Common Operations`}>
          {commonOptions}
        </optgroup>
      );
    }

    setOperationsOptions([commonOptsGroup, activeOptsGroup, postingOptsGroup]);
  }, [commonOptions, activeOptions, postingOptions]);
  // set the current selected operation
  // useEffect(() => {
  //   setSelectedOp(selectedOp);
  // }, [selectedOp]);

  // update the local list of added operations
  useEffect(() => {
    if (newConfiguration) {
      const ops = GranularityUtils.getOperationNames(
        newConfiguration,
        authority,
      );
      console.log({ ops });
      setAddedOps([...ops]);
    }
  }, [newConfiguration]);

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
          {operationsOptions}
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
