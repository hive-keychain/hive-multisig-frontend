import { ReactNode, useEffect, useState } from 'react';
import { Button, Stack } from 'react-bootstrap';
import { useReadLocalStorage } from 'usehooks-ts';
import { Authorities } from '../../interfaces';
import { useAppDispatch, useAppSelector } from '../../redux/app/hooks';
import {
  initializeAuthorities,
  setActiveAuthUpdate,
  setActiveKeyDelete,
  setOwnerAuthUpdate,
  setOwnerKeyDelete,
  setPostingAuthUpdate,
  setPostingKeyDelete,
} from '../../redux/features/updateAuthorities/updateAuthoritiesSlice';
import { AuthorityCard } from '../cards/Account/AuthorityCard';
import { UpdateAuthoritiesConfirmation } from '../modals/UpdateAuthoritiesConfirmation';

interface IAccountPageProp {
  authorities: Authorities;
}
function AccountPage({ authorities }: IAccountPageProp) {
  const dispatch = useAppDispatch();
  let isLoggedIn = useReadLocalStorage<boolean>('loginStatus');
  const [accountAuthorities, setAccountAuthorities] = useState(authorities);
  const [show, setShow] = useState(false);
  const [display, setDisplay] = useState(false);
  const [loginState, setLoginState] = useState<boolean>(isLoggedIn);
  const [authorityCards, setAuthorityCards] = useState<ReactNode[]>([]);

  const newAuthorities = useAppSelector(
    (state) => state.updateAuthorities.NewAuthorities,
  );
  const [updateAuthorityState, ownerState, activeState, postingState] =
    useAuthoritiesUpdateState();
  useResetUpdateStates();
  useEffect(() => {
    setLoginState(isLoggedIn);
  }, [isLoggedIn]);

  useEffect(() => {
    if (authorities) {
      setAccountAuthorities({ ...authorities });
    } else {
      setDisplay(false);
    }
  }, [authorities]);

  useEffect(() => {
    if (accountAuthorities) {
      dispatch(initializeAuthorities(accountAuthorities));
      setDisplay(true);
      const newCards = [
        <AuthorityCard authorityName={'Owner'} />,
        <AuthorityCard authorityName={'Active'} />,
        <AuthorityCard authorityName={'Posting'} />,
      ];
      setAuthorityCards([...newCards]);
    }
  }, [accountAuthorities]);

  const validOwnerThreshold = (): boolean => {
    let totalWeight = 0;
    newAuthorities.owner.account_auths.forEach((account) => {
      totalWeight += account[1];
    });
    newAuthorities.owner.key_auths.forEach((key) => {
      totalWeight += key[1];
    });

    return totalWeight >= newAuthorities.owner.weight_threshold;
  };

  const validActiveThreshold = (): boolean => {
    let totalWeight = 0;
    newAuthorities.active.account_auths.forEach((account) => {
      totalWeight += account[1];
    });
    newAuthorities.active.key_auths.forEach((key) => {
      totalWeight += key[1];
    });

    return totalWeight >= newAuthorities.active.weight_threshold;
  };

  const validPostingThreshold = (): boolean => {
    let totalWeight = 0;
    newAuthorities.posting.account_auths.forEach((account) => {
      totalWeight += account[1];
    });
    newAuthorities.posting.key_auths.forEach((key) => {
      totalWeight += key[1];
    });
    return totalWeight >= newAuthorities.posting.weight_threshold;
  };

  const handleUpdateBtn = () => {
    if (updateAuthorityState) {
      var validOwner = validOwnerThreshold();
      var validActive = validActiveThreshold();
      var validPosting = validPostingThreshold();
      if (validOwner && validActive && validPosting) {
        handleShow();
      } else {
        alert(`${validOwner ? '' : 'Owner weight assignments are invalid.\n'}${
          validActive ? '' : 'Active weight assignments are invalid.\n'
        }${
          validPosting ? '' : 'Posting weight assignments are invalid.\n'
        }Total weight must be greater than or equal to weight threshold.
        `);
      }
    }
  };
  const handleResetBtn = () => {
    if (updateAuthorityState) {
      window.location.reload();
    }
  };
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return display ? (
    <div>
      <UpdateAuthoritiesConfirmation show={show} handleClose={handleClose} />
      <Stack gap={3}>
        {
          <span>
            &#9888; {'Authorities can only be updated every two hours'}
          </span>
        }
        {authorityCards
          ? authorityCards.map((e) => {
              return e;
            })
          : ''}
        {loginState ? (
          <Stack direction="horizontal" gap={2}>
            <Button
              className="ms-auto"
              type="button"
              variant="secondary"
              onClick={() => handleResetBtn()}>
              Reset
            </Button>{' '}
            <Button
              variant="success"
              type="button"
              onClick={() => handleUpdateBtn()}>
              Update
            </Button>{' '}
          </Stack>
        ) : (
          <div></div>
        )}
      </Stack>
    </div>
  ) : (
    <div></div>
  );
}
const useAuthoritiesUpdateState = () => {
  const isOwnerAuthUpdated = useAppSelector(
    (state) => state.updateAuthorities.isOwnerAuthUpdated,
  );
  const isPostingAuthUpdated = useAppSelector(
    (state) => state.updateAuthorities.isPostingAuthUpdated,
  );
  const isActiveAuthUpdated = useAppSelector(
    (state) => state.updateAuthorities.isActiveAuthUpdated,
  );
  const [activeState, setIsActiveUpdated] =
    useState<boolean>(isActiveAuthUpdated);
  const [postingState, setIsPostingUpdate] =
    useState<boolean>(isPostingAuthUpdated);

  useEffect(() => {
    setIsActiveUpdated(isActiveAuthUpdated);

    setIsPostingUpdate(isPostingAuthUpdated);
  }, [isPostingAuthUpdated, isActiveAuthUpdated]);

  return [
    isOwnerAuthUpdated || activeState || postingState,
    isOwnerAuthUpdated,
    activeState,
    postingState,
  ];
};

const useResetUpdateStates = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setOwnerAuthUpdate(false));
    dispatch(setActiveAuthUpdate(false));
    dispatch(setPostingAuthUpdate(false));
    dispatch(setOwnerKeyDelete(false));
    dispatch(setActiveKeyDelete(false));
    dispatch(setPostingKeyDelete(false));
  }, []);
};
export default AccountPage;
