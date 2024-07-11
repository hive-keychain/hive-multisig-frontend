import { useEffect, useState } from 'react';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../../../redux/app/hooks';
import {
  botSetupSuccess,
  checkDefaultBot,
  removeBotSuccess,
  setTwoFABots,
  transactionSubmitted,
  updateThreshSuccess,
  updateWeightSuccess,
} from '../../../redux/features/twoFactorAuth/twoFactorAuthThunks';
import {
  allowAddAccount,
  allowAddKey,
  allowDeleteOnlyBot,
  allowEdit,
  disableDeleteBtn,
} from '../../../redux/features/updateAuthorities/updateAuthoritiesThunks';
import { AuthorityCard } from '../Account/AuthorityCard';

export const TwoFAConfirmation = () => {
  const dispatch = useAppDispatch();
  const addedBot = useAppSelector(
    (state) => state.twoFactorAuth.twoFactorAuth.addedBot,
  );
  const removedBot = useAppSelector(
    (state) => state.twoFactorAuth.twoFactorAuth.removedBot,
  );
  const botSetupSuccessFlag = useAppSelector(
    (state) => state.twoFactorAuth.twoFactorAuth.botSetupSuccess,
  );
  const removeBotSuccessFlag = useAppSelector(
    (state) => state.twoFactorAuth.twoFactorAuth.removeBotSuccess,
  );
  const updateThreshSuccessFlag = useAppSelector(
    (state) => state.twoFactorAuth.twoFactorAuth.updateThreshSuccess,
  );
  const updateWeightSuccessFlag = useAppSelector(
    (state) => state.twoFactorAuth.twoFactorAuth.updateWeightSuccess,
  );
  const transactionSubmittedFlag = useAppSelector(
    (state) => state.twoFactorAuth.twoFactorAuth.transactionSubmitted,
  );
  const isMultisigTransaction = useAppSelector(
    (state) => state.twoFactorAuth.twoFactorAuth.isMultisigTransaction,
  );
  const [heading, setHeading] = useState('');
  const [details, setDetails] = useState('');

  useEffect(() => {
    dispatch(allowAddKey(false));
    dispatch(allowAddAccount(false));
    dispatch(disableDeleteBtn(true));
    dispatch(allowDeleteOnlyBot(false));
    dispatch(allowEdit(false));
    window.addEventListener('beforeunload', handleCleanUp);
    return () => {
      window.removeEventListener('beforeunload', handleCleanUp);
    };
  }, []);
  const handleCleanUp = () => {
    dispatch(botSetupSuccess(false));
    dispatch(removeBotSuccess(false));
    dispatch(updateThreshSuccess(false));
    dispatch(transactionSubmitted(false));
    dispatch(updateWeightSuccess(false));
  };

  useEffect(() => {
    if (transactionSubmittedFlag) {
      if (!isMultisigTransaction) {
        if (botSetupSuccessFlag) {
          setHeading(`2FA setup success`);
        } else if (removeBotSuccessFlag) {
          setHeading(`2FA successfuly removed`);
        } else if (updateThreshSuccessFlag || updateWeightSuccessFlag) {
          setHeading(`2FA successfuly updated`);
        }
      } else {
        if (botSetupSuccessFlag) {
          setHeading(`2FA setup has been submitted for multisig transaction`);
        } else if (removeBotSuccessFlag) {
          setHeading(`2FA removal has been submitted for multisig transaction`);
        } else if (updateThreshSuccessFlag || updateWeightSuccessFlag) {
          setHeading(`2FA update has been submitted for multisig transaction`);
        }
      }
    }
  }, [transactionSubmittedFlag]);

  useEffect(() => {
    if (botSetupSuccessFlag) {
      setDetails(
        `${addedBot[0]} has been added as 2FA bot in your active authority with weight ${addedBot[1]}.`,
      );
    } else if (removeBotSuccessFlag) {
      setDetails(
        `${removedBot[0]} has been removed as 2FA bot in your active authority with weight ${removedBot[1]}.`,
      );
    } else if (updateThreshSuccessFlag || updateWeightSuccessFlag) {
      setDetails(`The weights and/or threshold has been updated.`);
    }
  }, [heading]);

  const handleProceedBtn = () => {
    dispatch(checkDefaultBot(undefined));
    dispatch(setTwoFABots(undefined));
    window.location.reload();
  };
  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col md="auto" lg="7">
          <Card border="secondary">
            <Container>
              <Card.Body>
                <h2 className="card-title text-center">{heading}</h2>
                <br />

                <p>{details}</p>
                {isMultisigTransaction ? (
                  <p>
                    {' '}
                    The account update has been requested for multisig
                    transaction. You may have to wait for the signatures of
                    other authorities before the changes take effect.
                  </p>
                ) : (
                  ''
                )}
                <div>
                  {' '}
                  <div>
                    <AuthorityCard authorityName="Active" />
                  </div>
                </div>
                <div className="mt-3 d-flex justify-content-end">
                  <Button
                    onClick={() => {
                      handleProceedBtn();
                    }}
                    className=""
                    variant="success">
                    Proceed
                  </Button>
                </div>
              </Card.Body>
            </Container>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
