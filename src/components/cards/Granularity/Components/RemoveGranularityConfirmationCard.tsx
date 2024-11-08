import { KeychainKeyTypes } from 'hive-keychain-commons';
import { useEffect, useState } from 'react';
import { Button, Card, Container, Row } from 'react-bootstrap';
import { MultisigGbotConfig } from '../../../../interfaces/granularity.interface';
import { useAppDispatch, useAppSelector } from '../../../../redux/app/hooks';
import {
  allowAddAccount,
  allowDeleteOnlyBot,
  allowEdit,
  disableDeleteBtn,
} from '../../../../redux/features/updateAuthorities/updateAuthoritiesThunks';
import { GranularityUtils } from '../../../../utils/granularity-utils';
import { MultisigUtils } from '../../../../utils/multisig.utils';
import { AuthorityCard } from '../../Account/AuthorityCard';
import { MultisigGranularityHooks } from '../GranularitySetupHooks';

export const RemoveGranularityConfirmationCard = () => {
  const dispatch = useAppDispatch();
  const signedAccountObj = useAppSelector((state) => state.login.accountObject);
  const transactionState = useAppSelector(
    (state) => state.transaction.transaction,
  );
  const granularityBots = useAppSelector(
    (state) => state.granularity.granularity.bots,
  );
  const [authority, newAuthorities] = MultisigGranularityHooks.useAuthorities();
  const [activeBotAuths, setActiveBotAuths] = useState([]);
  const [postingBotAuths, setAPostingAuths] = useState([]);

  const [deductedPostingWeight, setDeductedPostingWeight] = useState(0);
  const [deductedActiveWeight, setDeductedActiveWeight] = useState(0);
  useEffect(() => {
    console.log({ granularityBots });
    console.log({ activeBotAuths });
    console.log({ postingBotAuths });
    dispatch(allowEdit(false));
    dispatch(disableDeleteBtn(true));
    dispatch(allowAddAccount(false));
    dispatch(allowDeleteOnlyBot(false));
  }, []);

  useEffect(() => {
    if (granularityBots) {
      const active = granularityBots
        .map((bot) => {
          if (
            bot.keyType.toLowerCase() === KeychainKeyTypes.active.toLowerCase()
          ) {
            return GranularityUtils.getAuthority(bot.botName, authority);
          }
          return null; // Explicitly return null for bots that don’t match
        })
        .filter(Boolean); // Filter out any null or undefined values

      const posting = granularityBots
        .map((bot) => {
          if (
            bot.keyType.toLowerCase() === KeychainKeyTypes.posting.toLowerCase()
          ) {
            return GranularityUtils.getAuthority(bot.botName, authority);
          }
          return null;
        })
        .filter(Boolean);

      setActiveBotAuths(active);
      setAPostingAuths(posting);
    }
  }, [granularityBots]);

  useEffect(() => {
    if (activeBotAuths) {
      const activeWeight = activeBotAuths.reduce((sum, item) => {
        if (Array.isArray(item) && typeof item[1] === 'number') {
          return sum + item[1];
        }
        return sum;
      }, 0);

      setDeductedActiveWeight(activeWeight);
    }

    if (postingBotAuths) {
      const postingWeight = postingBotAuths.reduce((sum, item) => {
        if (Array.isArray(item) && typeof item[1] === 'number') {
          return sum + item[1];
        }
        return sum;
      }, 0);
      setDeductedPostingWeight(postingWeight);
    }
  }, [activeBotAuths, postingBotAuths]);
  const handleBroadcast = async () => {
    const botAuth: [string, number] = GranularityUtils.getAuthority(
      granularityBots[0].botName,
      newAuthorities,
    );
    const newConfig: MultisigGbotConfig = {
      id: 'multisig-gbot-config',
      json: {
        configurations: [],
      },
    };
    const res = await MultisigUtils.granularityConfigBroadcast(
      signedAccountObj.data.username,
      botAuth,
      newConfig,
      transactionState.initiator,
      newAuthorities,
    );

    if (res) {
      window.location.reload();
      alert(res);
    }
  };

  const handleCancel = () => {
    window.location.reload();
  };
  return (
    <Container>
      <Row className="justify-content-md-center">
        <Card border="secondary">
          <Container>
            <Card.Body>
              <h3 className="card-title text-center">
                Multisig Granularity Bot Removal
              </h3>
              <div>
                {' '}
                <p>
                  The granularity configuration will be removed and the
                  following authorities will be updated. Please verify the
                  changes before broadcasting.
                </p>
              </div>

              <div>
                <p>
                  {activeBotAuths.map((bot) => {
                    return `@${bot[0]} `;
                  })}{' '}
                  will be removed from active authority and the threshold will
                  be deducted by {deductedActiveWeight}.
                </p>
                <AuthorityCard authorityName="Active" />
                <br />
                <p>
                  {postingBotAuths.map((bot) => {
                    return `@${bot[0]} `;
                  })}{' '}
                  will be removed from posting authority the threshold will be
                  deducted by {deductedPostingWeight}.
                </p>
                <AuthorityCard authorityName="Posting" />{' '}
                <div className="d-flex justify-content-end mt-2 mb-3 me-3 rem-10">
                  <Button
                    onClick={() => {
                      handleCancel();
                    }}
                    className="me-2"
                    variant="secondary">
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      handleBroadcast();
                    }}
                    className=""
                    variant="success">
                    Submit
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Container>
        </Card>
      </Row>
    </Container>
  );
};
