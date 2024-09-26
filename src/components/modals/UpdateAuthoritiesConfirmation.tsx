import * as Hive from '@hiveio/dhive';
import { HiveMultisig } from 'hive-multisig-sdk/src';
import { useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { Authorities } from '../../interfaces';
import { useAppDispatch, useAppSelector } from '../../redux/app/hooks';
import {
  resetOperation,
  setInitiator,
} from '../../redux/features/transaction/transactionThunks';
import HiveUtils from '../../utils/hive.utils';
import { MultisigUtils } from '../../utils/multisig.utils';
import { useDidMountEffect } from '../../utils/utils';
import { OtpModal } from './OtpModal';

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

  const [
    updateAuthorityState,
    activeState,
    postingState,
    isActiveKeyDeleted,
    isPostingKeyDeleted,
  ] = useAuthoritiesUpdateState();
  const [askOtp, setAskOtp] = useState<boolean>(false);

  const originalAuthorities = useAppSelector(
    (state) => state.updateAuthorities.Authorities,
  );
  const newAuthorities = useAppSelector(
    (state) => state.updateAuthorities.NewAuthorities,
  );
  const signedAccountObj = useAppSelector((state) => state.login.accountObject);
  const transactionState = useAppSelector(
    (state) => state.transaction.transaction,
  );
  const [isReloadWindow, setReloadWindow] = useState<boolean>(false);
  const [newAuths, setNewAuths] = useState<Authorities>(newAuthorities);

  const [showModal, setShowModal] = useState<boolean>(show);
  const twoFASigners = useAppSelector(
    (state) => state.multisig.multisig.twoFASigners,
  );

  useEffect(() => {
    setShowModal(show);
    setMultisig(HiveMultisig.getInstance(window, MultisigUtils.getOptions()));
  }, [show]);

  useEffect(() => {
    setNewAuths({ ...newAuthorities });
  }, [newAuthorities]);

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
    console.log('========== Starting Account Update ==========');
    if (updateAuthorityState) {
      MultisigUtils.accountUpdateWithActiveAuthority(
        signedAccountObj.data.username,
        await HiveUtils.getInitiator(
          signedAccountObj.data.username,
          originalAuthorities.active,
        ),
        originalAuthorities.active,
        newAuthorities,
        twoFASigners,
      )
        .then(async (res) => {
          if (res) {
            confirm(res.toString());
            await dispatch(resetOperation());
            window.location.reload();
          }
        })
        .catch((reason) => {
          alert(reason);
        });
    } else {
      setReloadWindow(false);
    }
  };

  const handleOtp = async () => {
    setShowModal(false);
    setAskOtp(true);
  };

  const handleSetInitiator = async () => {
    const active_auth = originalAuthorities.active.key_auths[0];
    const initiator = {
      username: signedAccountObj.data.username,
      publicKey: active_auth[0].toString(),
      weight: active_auth[1],
    };
    await dispatch(setInitiator(initiator));
  };
  const handleModalClose = () => {
    window.location.reload();
    handleClose();
  };
  return (
    <div>
      <div>
        <OtpModal handleSubmit={handleUpdate} show={askOtp} />
      </div>
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
                twoFASigners ? handleOtp() : handleUpdate();
              }}>
              Update
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

const useAuthoritiesUpdateState = () => {
  const isPostingAuthUpdated = useAppSelector(
    (state) => state.updateAuthorities.isPostingAuthUpdated,
  );
  const isActiveAuthUpdated = useAppSelector(
    (state) => state.updateAuthorities.isActiveAuthUpdated,
  );

  const isActiveKeyDeleted = useAppSelector(
    (state) => state.updateAuthorities.isActiveKeyDeleted,
  );
  const isPostingKeyDeleted = useAppSelector(
    (state) => state.updateAuthorities.isPostingKeyDeleted,
  );

  return [
    isActiveAuthUpdated || isPostingAuthUpdated,
    isActiveAuthUpdated,
    isPostingAuthUpdated,
    isActiveKeyDeleted,
    isPostingKeyDeleted,
  ];
};
