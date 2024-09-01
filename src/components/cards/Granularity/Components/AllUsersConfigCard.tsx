import { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import { Operation } from '../../../../interfaces/granularity.interface';
import { MultisigGranularityHooks } from '../GranularitySetupHooks';
import { OperationRow } from './OperationRow';
import { OperationSelection } from './OperationSelection';

export const AllUsersConfigCard = () => {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [configuration, newConfiguration] =
    MultisigGranularityHooks.useGranularityConfiguration();

  useEffect(() => {
    if (newConfiguration) {
      const existingOperations = newConfiguration.json.configurations.find(
        (configuration) => !configuration.authority,
      )?.operations;

      if (existingOperations) {
        setOperations(existingOperations);
      }
    }
  }, [newConfiguration]);
  return (
    <div className="my-1 mx-2">
      <div className="mx-2">
        <OperationSelection />
      </div>
      <div>
        <div className="d-flex align-items-center my-2 mx-2">
          <Card className="flex-grow-1 ">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div>Operations</div>
            </Card.Header>
            <Card.Body className="card-scroll" id="card-body">
              {operations && operations.length > 0 ? (
                operations.map((op, index) => {
                  return (
                    <OperationRow
                      operation={op.operationName}
                      key={index.toString()}
                    />
                  );
                })
              ) : (
                <div className="text-center text-muted">Add Operation</div>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};
