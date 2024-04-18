import { HiveMultisig } from 'hive-multisig-sdk/src';
import { useEffect, useState } from 'react';
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../../../redux/app/hooks';
import { resetOperation } from '../../../redux/features/transaction/transactionThunks';
import { MultisigUtils } from '../../../utils/multisig.utils';
import { AuthorityCard } from '../Account/AuthorityCard';
import { MultisigTwoFAHooks } from './Multisig2FAHooks';
var deepequal = require('deep-equal');

export const MultisigTwoFactorAuthSetup = () => {
  const [originalActive, newActive] = MultisigTwoFAHooks.useActiveAuthority();
  const [thresholdWarning] = MultisigTwoFAHooks.useWeightRestriction();
  const [
    updateAuthorityState,
    activeState,
    postingState,
    isActiveKeyDeleted,
    isPostingKeyDeleted,
  ] = MultisigTwoFAHooks.useAuthoritiesUpdateState();
  const [multisigInitiator] = MultisigTwoFAHooks.useMultisigInitiatorHandler();

  const [setUseHiveKeychainAccount] =
    MultisigTwoFAHooks.useHiveKeychainBotAccount(true);
  const [localOriginalActive, setLocalOriginalActive] =
    useState(originalActive);
  const secret = useAppSelector(
    (state) => state.twoFactorAuth.twoFactorAuth.secret,
  );
  const [multisig, setMultisig] = useState<HiveMultisig>(undefined);

  const originalAuthorities = useAppSelector(
    (state) => state.updateAuthorities.Authorities,
  );
  const newAuthorities = useAppSelector(
    (state) => state.updateAuthorities.NewAuthorities,
  );
  const transactionState = useAppSelector(
    (state) => state.transaction.transaction,
  );
  const signedAccountObj = useAppSelector((state) => state.login.accountObject);
  const dispatch = useAppDispatch();
  useEffect(() => {
    setMultisig(HiveMultisig.getInstance(window, MultisigUtils.getOptions()));
  }, []);
  useEffect(() => {
    if (originalActive) {
      setLocalOriginalActive(originalActive);
    }
  }, [originalActive]);
  const [isUseMultisigBotAccount, setUseMultisigBotAccount] = useState(true);
  const [debouncedRadioStatus, setDebouncedRadio] = useState(
    isUseMultisigBotAccount,
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedRadio(isUseMultisigBotAccount);
    }, 300);

    return () => clearTimeout(timeout);
  }, [isUseMultisigBotAccount]);

  useEffect(() => {
    setUseHiveKeychainAccount(debouncedRadioStatus);
  }, [debouncedRadioStatus]);

  const handleUpdateAccount = async () => {
    if (updateAuthorityState) {
      MultisigUtils.accountUpdateWithActiveAuthority(
        signedAccountObj.data.username,
        transactionState.initiator,
        originalActive,
        newAuthorities,
      )
        .then(async (res) => {
          if (res) {
            await dispatch(resetOperation());
            window.location.reload();
          }
        })
        .catch((reason) => {
          alert(reason);
        });
    }
  };

  // const handle2FAConfigBroadcast = async () => {
  //   newAuthorities.active.account_auths.forEach(async (bot) => {
  //     const isValid = await MultisigUtils.checkMultisigBot(bot[0]);
  //     let twoFACodes: TwoFACodes;
  //     if (isValid) {
  //       const memoKey = await HiveUtils.getAccountMemoKey(bot[0]);
  //       const keyType = KeychainKeyTypes.active;

  //       const customJsonOp = {
  //         required_auths: [originalAuthorities.account],
  //         required_posting_auths: [] as string[],
  //         id: 'setToFAId'
  //         json:
  //       };
  //       const op = ['account_update', updatedAuthorities];
  //       const transaction = await HiveTxUtils.createTx([op], {
  //         date: undefined,
  //         minutes: 60,
  //       } as IExpiration);

  //       // const encodedMessage = await HiveUtils.encodeMessage(
  //       //   originalAuthorities.account,
  //       //   bot[0],
  //       //   memoKey,
  //       //   KeychainKeyTypes.active,
  //       // );
  //       // twoFACodes[bot[0]] = encodedMessage;
  //     }
  //   });

  //   //get bot memokey
  //   // encrypt 2fa secret
  //   //
  // };

  const handleRadioChange = (e: any) => {
    const value = e.target.value === 'yes';
    setUseMultisigBotAccount(value);
  };
  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col md="auto" lg="7">
          <Card border="secondary">
            <Container>
              <Card.Body>
                <h3 className="card-title text-center">Multisig 2FA Setup</h3>
                <p className="justify-content-md-center">
                  {' '}
                  To complete the Two Factor Authentication setup, it is
                  required to add a multig bot account in your account
                  authorities.
                </p>

                <p>
                  Do you wish to use <strong>@hive.multisig</strong> as the bot
                  provided by Hive Keychain?
                </p>

                <div>
                  <Form>
                    <Form.Check
                      inline
                      type="radio"
                      label="Yes"
                      value="yes"
                      checked={isUseMultisigBotAccount}
                      onChange={handleRadioChange}
                    />
                    <Form.Check
                      inline
                      type="radio"
                      label="No"
                      value="no"
                      checked={!isUseMultisigBotAccount}
                      onChange={handleRadioChange}
                    />
                  </Form>
                </div>
                <p>
                  Otherwise you may use your own account configured as a bot.
                </p>
                {originalActive?.weight_threshold === 1 ? (
                  <p className="justify-content-md-center">
                    ⚠ With your current Active Authority settings, we suggest to
                    add <strong>@hive.multisig</strong> or your bot account with
                    weight of 1 and bumped the weight threshold to 2 as follows:
                  </p>
                ) : (
                  <p className="justify-content-md-center">
                    ⚠ For the 2FA to work correctly, both the user accounts,keys
                    and @hive.multisig must have a weight less than the
                    threshold. Therefore we suggest the following adjustments in
                    your active authorities:
                  </p>
                )}
                {<p>The following account/s are not bot: </p>}
                <AuthorityCard authorityName="Active" />
                <br />
                <p className="justify-content-md-center">
                  Please review the suggested modifications above. You may make
                  your own modification as you desire. Press submit to broadcast
                  the changes.
                </p>
                <div className="d-flex justify-content-end">
                  <Button
                    onClick={() => {
                      handleUpdateAccount();
                    }}
                    className=""
                    variant="success">
                    Submit
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
