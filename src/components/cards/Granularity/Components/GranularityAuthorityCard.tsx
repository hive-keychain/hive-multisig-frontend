import { useEffect, useState } from 'react';
import { Accordion, Button, Card } from 'react-bootstrap';
import { Operation } from '../../../../interfaces/granularity.interface';
import { useAppDispatch } from '../../../../redux/app/hooks';
import { updateGranularityConfiguration } from '../../../../redux/features/granularity/granularityThunks';
import { GranularityUtils } from '../../../../utils/granularity-utils';
import { MultisigGranularityHooks } from '../GranularitySetupHooks';
import { OperationRow } from './OperationRow';
import { OperationSelection } from './OperationSelection';

export interface IGranularityAuthorityCard {
  isConfirmation?: boolean;
  authority: string;
}
export const GranularityAuthorityCard = ({
  authority,
  isConfirmation,
}: IGranularityAuthorityCard) => {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [configuration, newConfiguration] =
    MultisigGranularityHooks.useGranularityConfiguration();

  useEffect(() => {
    if (newConfiguration) {
      const addedOps = GranularityUtils.getOperationNames(
        newConfiguration,
        authority,
      );
      if (addedOps && addedOps.length > 0) {
        const ops = addedOps.map((op) => {
          return { operationName: op } as Operation;
        });
        setOperations(ops);
      } else {
        setOperations([]);
      }
    }
  }, [newConfiguration]);
  const handleToggle = () => {
    setOpen(!open);
  };
  const handleDeleteAuthority = () => {
    const updatedConfiguration = GranularityUtils.removeAuthority(
      authority,
      newConfiguration,
    );
    dispatch(updateGranularityConfiguration(updatedConfiguration));
  };
  return (
    <div className="d-flex align-items-center my-1 mx-2">
      <div className="flex-grow-1">
        <Card>
          <Card.Header className="d-flex justify-content-between align-items-center">
            <div>{authority}</div>

            <div>
              {isConfirmation ? (
                ' '
              ) : (
                <Button
                  variant="outline-danger"
                  onClick={handleDeleteAuthority}>
                  <i className="fa fa-trash"></i>
                </Button>
              )}
              <Button
                className="ms-2"
                variant="outline-dark"
                onClick={handleToggle}
                aria-controls="card-body"
                aria-expanded={open}>
                {open ? (
                  <i className="fa fa-chevron-down" />
                ) : (
                  <i className="fa fa-chevron-up" />
                )}
              </Button>
            </div>
          </Card.Header>
          <Accordion.Collapse eventKey={authority} in={open}>
            <div className="my-1 mx-2">
              {isConfirmation ? (
                ''
              ) : (
                <div className="mx-2">
                  <OperationSelection authority={authority} />
                </div>
              )}
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
                              operation={op}
                              authority={authority}
                              key={index.toString()}
                            />
                          );
                        })
                      ) : isConfirmation ? (
                        ''
                      ) : (
                        <div className="text-center text-muted">
                          Add Operation
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </div>
              </div>
            </div>
          </Accordion.Collapse>
        </Card>
      </div>
    </div>
  );
};
