import * as Hive from '@hiveio/dhive';
import { HiveMultisig } from 'hive-multisig-sdk/src';
import { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import {
  IExpiration,
  TxStatus,
} from '../../../interfaces/transaction.interface';
import { TwoFACodes } from '../../../interfaces/twoFactorAuth.interface';
import { useAppDispatch, useAppSelector } from '../../../redux/app/hooks';
import { setTwoFASigners } from '../../../redux/features/multisig/multisigThunks';
import { setTxStatus } from '../../../redux/features/transaction/transactionThunks';
import { isManageTwoFA } from '../../../redux/features/twoFactorAuth/twoFactorAuthThunks';
import {
  allowAddAccount,
  allowAddKey,
  allowDeleteOnlyBot,
  allowEdit,
  disableDeleteBtn,
  setThresholdWarning,
} from '../../../redux/features/updateAuthorities/updateAuthoritiesThunks';
import HiveTxUtils from '../../../utils/hivetx.utils';
import { MultisigUtils } from '../../../utils/multisig.utils';
import { OtpModal } from '../../modals/OtpModal';
import { AuthorityCard } from '../Account/AuthorityCard';
import { MultisigTwoFAHooks } from './Multisig2FAHooks';
var deepequal = require('deep-equal');
const defaultBot = process.env.BOT;
export const ManageTwoFaAccount = () => {
  const dispatch = useAppDispatch();
  const multisig = useMultisigState();

  const [suggestedThreshold] = useSuggestNewThreshold();
  const [askOtp, setAskOtp] = useState<boolean>(false);

  const twoFASigners = useAppSelector(
    (state) => state.multisig.multisig.twoFASigners,
  );
  const newAuthorities = useAppSelector(
    (state) => state.updateAuthorities.NewAuthorities,
  );
  const thresholdWarning = useAppSelector(
    (state) => state.updateAuthorities.thresholdWarning,
  );
  const bots = useAppSelector(
    (state) => state.twoFactorAuth.twoFactorAuth.bots,
  );

  const [accountEdited] = MultisigTwoFAHooks.useAccountEditedFlag();
  const signedAccountObj = useAppSelector((state) => state.login.accountObject);
  const transactionState = useAppSelector(
    (state) => state.transaction.transaction,
  );
  useEffect(() => {
    allowRemoveBot();
    dispatch(isManageTwoFA(true));
    initi2FASigners();
  }, []);
  useEffect(() => {
    if (suggestedThreshold) {
      console.log({ suggestedThreshold });
      dispatch(
        setThresholdWarning(
          'You may not set a threshold bigger than the sum of the authority weights. ' +
            `Please increase the weights of your authorities or decrease the threshold to ${suggestedThreshold}`,
        ),
      );
    } else {
      dispatch(setThresholdWarning(``));
    }
  }, [suggestedThreshold]);

  const initi2FASigners = async () => {
    if (bots) {
      let botSigners: TwoFACodes = {};
      for (let i = 0; i < bots.length; i++) {
        botSigners[bots[i][0]] = '';
      }
      dispatch(setTwoFASigners(botSigners));
    }
  };
  const allowRemoveBot = async () => {
    dispatch(allowAddKey(false));
    dispatch(allowEdit(true));
    dispatch(allowAddAccount(false));
    dispatch(disableDeleteBtn(true));
    dispatch(allowDeleteOnlyBot(true));
  };
  const handleOtpSubmit = async () => {
    try {
      const updateAccountOp = await MultisigUtils.getUpdateAccountOp(
        newAuthorities,
      );
      const tx = await HiveTxUtils.createTx([updateAccountOp], {
        date: undefined,
        minutes: 60,
      } as IExpiration);

      MultisigUtils.broadcastTransaction(
        tx,
        signedAccountObj.data.username,
        transactionState.initiator,
        twoFASigners,
      )
        .then(() => {
          dispatch(setTxStatus(TxStatus.success));
        })
        .catch((e) => {
          dispatch(setTxStatus(TxStatus.failed));
        });
    } catch (error) {
      dispatch(setTxStatus(TxStatus.failed));
    }
  };

  const handleUpdateAccount = async () => {
    if (thresholdWarning !== '') {
      alert(`Invalid Threshold: ${thresholdWarning}`);
    }
    setAskOtp(true);
  };

  return (
    <div>
      <OtpModal handleSubmit={handleOtpSubmit} show={askOtp} />
      <div className="mb-2">
        <h1 className="justify-content-md-center">Manage Bot</h1>
      </div>
      <div>
        <AuthorityCard authorityName="Active" />
      </div>

      <div className="d-flex justify-content-end mb-3 me-3 mt-3">
        <Button
          onClick={() => {
            handleUpdateAccount();
          }}
          className=""
          variant="success"
          disabled={accountEdited}>
          Submit
        </Button>
      </div>
    </div>
  );
};

const useSuggestNewThreshold = () => {
  const [originalActive, newActive] = MultisigTwoFAHooks.useActiveAuthority();
  const [suggestedThreshold, setSuggestedThreshold] = useState(undefined);

  useEffect(() => {
    if (newActive) {
      if (!deepequal(originalActive, newActive, { strict: true })) {
        const newThresh = suggestNewThreshold(newActive);
        setSuggestedThreshold(newThresh);
      }
    }
  }, [newActive]);

  return [suggestedThreshold];
};

const suggestNewThreshold = (activeAuthority: Hive.AuthorityType) => {
  if (activeAuthority) {
    const currentThresh = activeAuthority.weight_threshold;
    const totalActiveWeight = activeAuthority.account_auths.reduce(
      (total, account) => total + account[1],
      0,
    );
    const totalKeyWeight = activeAuthority.key_auths.reduce(
      (total, key) => total + key[1],
      0,
    );
    const totalWeight = totalActiveWeight + totalKeyWeight;
    if (currentThresh > totalWeight) {
      return totalWeight;
    } else {
      return undefined;
    }
  }
};

const useMultisigState = () => {
  const [multisig, setMultisig] = useState<HiveMultisig>(undefined);

  const signedAccountObj = useAppSelector((state) => state.login.accountObject);
  useEffect(() => {
    if (signedAccountObj) {
      setMultisig(HiveMultisig.getInstance(window, MultisigUtils.getOptions()));
    }
  }, []);
  return multisig;
};
