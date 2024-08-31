import { Button, Col, Container, Form, InputGroup, Row } from 'react-bootstrap';
import { Operation } from '../../../../interfaces/granularity.interface';
import { useAppDispatch } from '../../../../redux/app/hooks';
import { updateGranularityConfiguration } from '../../../../redux/features/granularity/granularityThunks';
import { GranularityUtils } from '../../../../utils/granularity-utils';
import { MultisigGranularityHooks } from '../GranularitySetupHooks';

interface IOperationRowProps {
  operation: string;
  authority?: string;
}
export const OperationRow = ({ operation, authority }: IOperationRowProps) => {
  const disptach = useAppDispatch();
  const [configuration, newConfiguration] =
    MultisigGranularityHooks.useGranularityConfiguration();

  const didplayName =
    operation === 'custom_json'
      ? 'Change Config'
      : operation
          .split('_')
          .map(
            (word) =>
              word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
          )
          .join(' ');
  const handleDelete = () => {
    const updatedConfiguration = structuredClone(newConfiguration);
    const opToBeDeleted = { operationName: operation } as Operation;
    let newConfig = undefined;
    if (authority && authority !== '') {
      newConfig = GranularityUtils.deleteOpFromAuthority(
        authority,
        opToBeDeleted,
        updatedConfiguration,
      );
    } else {
      newConfig = GranularityUtils.deleteAllUserOp(
        opToBeDeleted,
        newConfiguration,
      );
    }
    if (newConfig) {
      disptach(updateGranularityConfiguration(newConfig));
      console.log(`Delete ${operation}`);
    }
  };
  return (
    <Container className="my-2 d-flex justify-content-center align-items-center">
      <Row>
        <Col>
          <InputGroup>
            <InputGroup.Text>Operation</InputGroup.Text>
            <Form.Control
              className={`form-control`}
              id={authority ? `${authority}-${operation}` : `all-${operation}`}
              placeholder={didplayName}
              value={didplayName}
              readOnly={true}
            />
            <Button
              variant="outline-danger"
              onClick={() => {
                handleDelete();
              }}>
              <i className="fa fa-trash"></i>
            </Button>
          </InputGroup>
        </Col>
      </Row>
    </Container>
  );
};
