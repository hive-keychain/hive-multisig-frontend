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
import { IExpiration } from '../../interfaces/transaction.interface';
import { useAppDispatch, useAppSelector } from '../../redux/app/hooks';
import { resetOperation } from '../../redux/features/transaction/transactionThunks';
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

      const keyType = KeychainKeyTypes.active;

      const op = ['account_update', newAuthorities];
      const transaction = await HiveTxUtils.createTx([op], {
        date: undefined,
        minutes: 60,
      } as IExpiration);
      console.log('transaction: ', JSON.stringify(transaction));
      HiveUtils.getInitiator(
        signedAccountObj.data.username,
        originalAuthorities.active,
      )
        .then((initiator) => {
          if (initiator.weight >= originalAuthorities.active.weight_threshold) {
            HiveUtils.requestSignTx(
              transaction,
              signedAccountObj.data.username,
              keyType,
            )
              .then((signedTx) => {
                if (signedTx) {
                  HiveUtils.broadcastTx(signedTx).then(async (res) => {
                    if (res) {
                      await dispatch(resetOperation());
                      setReloadWindow(true);
                    } else {
                      alert('Failed to broadcast');
                    }
                  });
                } else {
                  alert('[UpdateAuthConf] Signed Tx Error');
                }
              })
              .catch((e) => {
                console.log('[UpdateAuthConf] Sign Error: ', e);
                alert(e);
              });
          } else {
            const txToEncode: IEncodeTransaction = {
              transaction: { ...transaction },
              method: keyType,
              expirationDate: moment().add(60, 'm').toDate(),
              initiator,
            };
            try {
              multisig.utils
                .encodeTransaction(txToEncode)
                .then((encodedTxObj) => {
                  multisig.wss
                    .requestSignatures(encodedTxObj)
                    .then(async () => {
                      await dispatch(resetOperation());
                      setReloadWindow(true);
                    });
                })
                .catch((e: any) => {
                  console.log('[UpdateAuthConf] encodeTransaction error: ', e);
                  alert(e.message);
                });
            } catch (error) {
              console.log('[UpdateAuthConf] encode catch error: ', error);
              alert(`${error}`);
            }
          }
        })
        .catch((e) => {
          console.log('[UpdateAuthConf] Global catch Error: ', e);
          alert(e);
        });
    } else {
      setReloadWindow(false);
    }
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
