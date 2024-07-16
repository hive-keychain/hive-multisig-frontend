import { useEffect, useRef, useState } from 'react';
import { Card, Col, Container, Row, Spinner } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../../../redux/app/hooks';
import {
  botSetupSuccess,
  removeBotSuccess,
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
import HiveUtils from '../../../utils/hive.utils';
import { AuthorityCard } from '../Account/AuthorityCard';

export const TwoFAConfirmation = () => {
  const dispatch = useAppDispatch();
  const origActiveAuthorites = useAppSelector(
    (state) => state.updateAuthorities.Authorities.active,
  );
  const username = useAppSelector(
    (state) => state.login.accountObject.data.username,
  );
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
  const MAX_VERIFICATION_RETRIES = 5;
  const POLL_INTERVAL = 3000;
  const [verificationRetryCount, setVerificationRetryCount] = useState(0);
  const [verificationTimeout, setVerificationTimeout] = useState(false);
  const [isChangesConfirmed, setIsChangesConfirmed] = useState(false);
  const [details, setDetails] = useState('');
  const [heading, setHeading] = useState('');
  const intervalRef = useRef(null);

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
      if (botSetupSuccessFlag) {
        setHeading(`2FA setup success`);
      } else if (removeBotSuccessFlag) {
        setHeading(`2FA successfuly removed`);
      } else if (updateThreshSuccessFlag || updateWeightSuccessFlag) {
        setHeading(`2FA successfuly updated`);
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

  const pollBotChanges = async () => {
    try {
      let bot: [string, number];
      if (removeBotSuccessFlag) {
        bot = removedBot;
      } else {
        bot = addedBot;
      }
      const auth = await HiveUtils.getActiveAuthorities(username);
      if (auth && auth.active && bot && bot.length > 0) {
        // adding or removing
        const index = auth.active.account_auths.findIndex(
          (acc) => acc[0] === bot[0],
        );
        if (removeBotSuccessFlag) {
          setIsChangesConfirmed(index < 0); // index must be -1 when bot has been removed;
        } else {
          setIsChangesConfirmed(index >= 0); // index must be >= 0 when bot has been added;
        }
      } else if (auth && auth.active && origActiveAuthorites) {
        //weight or thresh update
        const newThresh = auth.active.weight_threshold;
        const newTotalWeight = auth.active.account_auths.reduce(
          (sum, item) => sum + item[1],
          0,
        );
        const origThresh = origActiveAuthorites.weight_threshold;
        const origTotalWeight = origActiveAuthorites.account_auths.reduce(
          (sum, item) => sum + item[1],
          0,
        );

        setIsChangesConfirmed(
          newThresh !== origThresh || newTotalWeight !== origTotalWeight,
        );
      }
    } catch (e) {
      throw new Error(`Error polling bot changes: ${e}`);
    } finally {
      setVerificationRetryCount((prevCount) => prevCount + 1);
    }
  };

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      pollBotChanges();
    }, POLL_INTERVAL);

    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (isChangesConfirmed) {
      clearInterval(intervalRef.current);
    }
  }, [isChangesConfirmed]);

  useEffect(() => {
    console.log(verificationRetryCount);
    if (verificationRetryCount >= MAX_VERIFICATION_RETRIES) {
      setVerificationTimeout(true);
      clearInterval(intervalRef.current);
    }
  }, [verificationRetryCount]);

  return isChangesConfirmed ? (
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
              </Card.Body>
            </Container>
          </Card>
        </Col>
      </Row>
    </Container>
  ) : verificationTimeout ? (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="text-center">
        <i className="fa fa-exclamation-triangle" aria-hidden="true"></i>
        <p>Verification Failed</p>
      </div>
    </div>
  ) : (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="text-center">
        <Spinner animation="grow" />
        <p>Waiting for confirmation</p>
      </div>
    </div>
  );
};
