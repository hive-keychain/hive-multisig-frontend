import { useEffect, useState } from 'react';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../../../redux/app/hooks';
import { updateGranularityConfiguration } from '../../../redux/features/granularity/granularityThunks';
import { GranularityUtils } from '../../../utils/granularity-utils';
import { MultisigUtils } from '../../../utils/multisig.utils';
import { AllUsersConfigCard } from './Components/AllUsersConfigCard';
import { CustomUsersConfigCard } from './Components/CustomUsersConfigCard';
import { MultisigGranularityHooks } from './GranularitySetupHooks';
var deepequal = require('deep-equal');
export const GranularityConfigurationSetup = () => {
  const dispatch = useAppDispatch();
  const [disableButton, setDisableButtons] = useState(true);

  const [configuration, newConfiguration] =
    MultisigGranularityHooks.useGranularityConfiguration();
  const [authority, newAuthorities] = MultisigGranularityHooks.useAuthorities();
  const signedAccountObj = useAppSelector((state) => state.login.accountObject);
  const transactionState = useAppSelector(
    (state) => state.transaction.transaction,
  );
  const bots = useAppSelector((state) => state.granularity.granularity.bots);
  useEffect(() => {
    const disable = deepequal(configuration, newConfiguration, {
      strict: true,
    });
    setDisableButtons(disable);
  }, [newConfiguration, configuration]);

  const handleDiscard = () => {
    dispatch(updateGranularityConfiguration(configuration));
  };

  const handleUpdateAccount = async () => {
    const configToBroadcast =
      GranularityUtils.moveChangeConfigToCustomJson(newConfiguration);
    const botAuths = GranularityUtils.getBotAuthorities(bots, newAuthorities);
    console.log({ botAuths });
    const res = await MultisigUtils.granularityConfigBroadcast(
      signedAccountObj.data.username,
      botAuths[0],
      configToBroadcast,
      transactionState.initiator,
      newAuthorities,
    );

    if (res) {
      alert(res);
    }
  };

  return (
    <Container className="d-flex flex-fill justify-content-md-center">
      <Card border="secondary" className="w-100">
        <Container fluid>
          <Card.Body>
            <h3 className="card-title text-center">
              Granularity Configuration
            </h3>
          </Card.Body>
          <Row className="justify-content-between">
            <Col xs={12} md={6} className="mb-3">
              <Card className="h-100" border="secondary">
                <h4 className="text-center mt-2">All Users</h4>
                <AllUsersConfigCard />
              </Card>
            </Col>
            <Col xs={12} md={6} className="mb-3">
              <Card className="h-100" border="secondary">
                <h4 className="text-center mt-2">Custom</h4>
                <CustomUsersConfigCard />
              </Card>
            </Col>
          </Row>
        </Container>

        <div className="d-flex justify-content-end mb-3 me-3 rem-10">
          <Button
            onClick={() => {
              handleDiscard();
            }}
            disabled={disableButton}
            variant="danger">
            Discard
          </Button>

          <Button
            disabled={disableButton}
            onClick={() => {
              handleUpdateAccount();
            }}
            className="ms-2"
            variant="success">
            Submit
          </Button>
        </div>
      </Card>
    </Container>
  );
};
