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
  const [
    updateAuthorityState,
    activeState,
    postingState,
    isActiveKeyDeleted,
    isPostingKeyDeleted,
  ] = useAuthoritiesUpdateState();

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

  useEffect(() => {
    setShowModal(show);
    handleSetInitiator();
    setMultisig(HiveMultisig.getInstance(window, MultisigUtils.getOptions()));
  }, [show]);

  useEffect(() => {
    setNewAuths({ ...newAuthorities });
  }, [newAuthorities]);
  useEffect(() => {
    handleSetInitiator();
  }, [updateAuthorityState]);
  useDidMountEffect(() => {
    if (isReloadWindow) {
      setShowModal(false);
      window.location.reload();
    }
  }, [isReloadWindow]);

  const handleUpdate = async () => {
    if (updateAuthorityState) {
      MultisigUtils.accountUpdateWithActiveAuthority(
        signedAccountObj.data.username,
        transactionState.initiator,
        originalAuthorities.active,
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
    } else {
      setReloadWindow(false);
    }
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
