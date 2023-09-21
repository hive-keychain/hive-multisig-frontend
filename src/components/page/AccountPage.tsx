import { ReactNode, useEffect, useState } from 'react';
import { Button, Stack } from 'react-bootstrap';
import { useReadLocalStorage } from 'usehooks-ts';
import { Authorities } from '../../interfaces';
import { useAppDispatch, useAppSelector } from '../../redux/app/hooks';
import { initializeAuthorities } from '../../redux/features/updateAuthorities/updateAuthoritiesSlice';
import { AuthorityCard } from '../cards/Account/AuthorityCard';
import UpdateAuthoritiesConfirmation from '../modals/UpdateAuthoritiesConfirmation';

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
  const isOwnerAuthUpdated = useAppSelector(
    (state) => state.updateAuthorities.isOwnerAuthUpdated,
  );
  const isActiveAuthUpdated = useAppSelector(
    (state) => state.updateAuthorities.isActiveAuthUpdated,
  );
  const isPostingAuthUpdated = useAppSelector(
    (state) => state.updateAuthorities.isPostingAuthUpdated,
  );

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
        <AuthorityCard
          key={'Owner'}
          authorityName={'Owner'}
          authority={accountAuthorities.owner}
        />,
        <AuthorityCard
          key={'Active'}
          authorityName={'Active'}
          authority={accountAuthorities.active}
        />,
        <AuthorityCard
          key={'Posting'}
          authorityName={'Posting'}
          authority={accountAuthorities.posting}
        />,
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
    if (isOwnerAuthUpdated || isActiveAuthUpdated || isPostingAuthUpdated) {
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
    if (isOwnerAuthUpdated || isActiveAuthUpdated || isPostingAuthUpdated) {
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

export default AccountPage;
