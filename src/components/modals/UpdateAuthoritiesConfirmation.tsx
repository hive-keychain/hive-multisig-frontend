import * as Hive from '@hiveio/dhive';
import { KeychainKeyTypes } from 'hive-keychain-commons';
import { HiveMultisig } from 'hive-multisig-sdk/src';
import { IEncodeTransaction } from 'hive-multisig-sdk/src/interfaces/socket-message-interface';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { Authorities } from '../../interfaces';
import { IExpiration, Initiator } from '../../interfaces/transaction.interface';
import { useAppDispatch, useAppSelector } from '../../redux/app/hooks';
import {
  resetOperation,
  setInitiator,
} from '../../redux/features/transaction/transactionThunks';
import { setOwnerKey } from '../../redux/features/updateAuthorities/updateAuthoritiesSlice';
import HiveUtils from '../../utils/hive.utils';
import HiveTxUtils from '../../utils/hivetx.utils';
import { MultisigUtils } from '../../utils/multisig.utils';
import { useDidMountEffect } from '../../utils/utils';
interface Iprops {
  show: boolean;
  handleClose: Function;
}

export const UpdateAuthoritiesConfirmation = ({
  show,
  handleClose,
}: Iprops) => {
  const dispatch = useAppDispatch();

  const [multisig, setMultisig] = useState<HiveMultisig>(undefined);

  const originalAuthorities = useAppSelector(
    (state) => state.updateAuthorities.Authorities,
  );
  const newAuthorities = useAppSelector(
    (state) => state.updateAuthorities.NewAuthorities,
  );
  const isOwnerAuthUpdated = useAppSelector(
    (state) => state.updateAuthorities.isOwnerAuthUpdated,
  );
  const isPostingAuthUpdated = useAppSelector(
    (state) => state.updateAuthorities.isPostingAuthUpdated,
  );
  const isActiveAuthUpdated = useAppSelector(
    (state) => state.updateAuthorities.isActiveAuthUpdated,
  );

  const isOriginalActiveSufficient =
    originalAuthorities?.active.weight_threshold <=
    originalAuthorities?.active.account_auths.reduce((a, e) => (a += e[1]), 0) +
      originalAuthorities?.active.key_auths.reduce((a, e) => (a += e[1]), 0);
  const signedAccountObj = useAppSelector((state) => state.login.accountObject);
  const transactionState = useAppSelector(
    (state) => state.transaction.transaction,
  );
  const [isReloadWindow, setReloadWindow] = useState<boolean>(false);
  const [newAuths, setNewAuths] = useState<Authorities>(newAuthorities);
  const [isOwnerUpdate, setIsOwnerUpdated] =
    useState<boolean>(isOwnerAuthUpdated);
  const [isPostingUpdate, setIsPostingUpdate] =
    useState<boolean>(isPostingAuthUpdated);
  const [key, setKey] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(show);

  useEffect(() => {
    setShowModal(show);
    handleSetInitiator();
    setMultisig(HiveMultisig.getInstance(window, MultisigUtils.getOptions()));
  }, [show]);

  useDidMountEffect(() => {
    dispatch(setOwnerKey(key));
  }, [key]);

  useEffect(() => {
    setNewAuths({ ...newAuthorities });
  }, [newAuthorities]);
  useEffect(() => {
    setIsOwnerUpdated(isOwnerAuthUpdated);
  }, [isOwnerAuthUpdated]);
  useEffect(() => {
    setIsPostingUpdate(isPostingAuthUpdated);
  }, [isPostingUpdate]);

  useDidMountEffect(() => {
    if (isReloadWindow) {
      setShowModal(false);
      window.location.reload();
    }
  }, [isReloadWindow]);

  const orderAlphabetically = (
    auths: [string | Hive.PublicKey, number][],
  ): [string, number][] => {
    const names = auths.map((auth) => auth[0]).sort();
    const sortedArr: [string, number][] = [];
    for (let i = 0; i < names.length; i++) {
      const index = auths.findIndex((e) => e[0] == names[i]);
      const element: [string, number] = [
        auths[index][0].toString(),
        auths[index][1],
      ];
      sortedArr.push(element);
    }
    return sortedArr;
  };
  const handleUpdate = async () => {
    if (isPostingUpdate || isActiveAuthUpdated) {
      const activeAccounts = orderAlphabetically(newAuths.active.account_auths);
      const activeKeys = orderAlphabetically(newAuths.active.key_auths);
      const postingAccounts = orderAlphabetically(
        newAuths.posting.account_auths,
      );
      const postingKeys = orderAlphabetically(newAuths.posting.key_auths);

      const newAuthorities: Authorities = {
        ...newAuths,
        owner: undefined,
        active: {
          account_auths: activeAccounts,
          key_auths: activeKeys,
          weight_threshold: newAuths.active.weight_threshold,
        },
        posting: {
          account_auths: postingAccounts,
          key_auths: postingKeys,
          weight_threshold: newAuths.posting.weight_threshold,
        },
      };
      const op = ['account_update', newAuthorities];
      const transaction = await HiveTxUtils.createTx([op], {
        date: undefined,
        minutes: 60,
      } as IExpiration);

      const txToEncode: IEncodeTransaction = {
        transaction: { ...transaction },
        method: KeychainKeyTypes.active,
        expirationDate: moment().add(60, 'm').toDate(),
        initiator: { ...transactionState.initiator },
      };

      try {
        multisig.utils.encodeTransaction(txToEncode).then((encodedTxObj) => {
          multisig.wss.requestSignatures(encodedTxObj).then(async () => {
            await dispatch(resetOperation());
            setReloadWindow(true);
          });
        });
      } catch (error) {
        alert(`${error}`);
        setReloadWindow(true);
      }
    } else {
      setReloadWindow(false);
    }
  };

  const handleSetInitiator = async () => {
    const keyType = isOriginalActiveSufficient
      ? KeychainKeyTypes.active
      : KeychainKeyTypes.posting;
    const auth = await HiveUtils.getAccountPublicKeyAuthority(
      signedAccountObj.data.username,
      keyType,
    );
    const initiator: Initiator = {
      username: signedAccountObj.data.username,
      publicKey: auth[0].toString(),
      weight: auth[1],
    };
    await dispatch(setInitiator(initiator));
  };
  const handleModalClose = () => {
    window.location.reload();
    handleClose();
  };
  return (
    <div
      className="modal updateAuthoritiesModal"
      style={{ display: 'block', position: 'initial' }}>
      <Modal
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        show={showModal}
        onHide={() => {
          handleModalClose();
        }}
        backdrop="static"
        keyboard={false}
        centered>
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Update Account Authorities
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Label>Are you sure you want to update?</Form.Label>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              handleModalClose();
            }}>
            Close
          </Button>

          <Button
            variant="primary"
            onClick={() => {
              handleUpdate();
            }}>
            Update
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
