import { useEffect, useState } from 'react';
import { Button, Stack } from 'react-bootstrap';
import { useReadLocalStorage } from 'usehooks-ts';
import { Authorities } from '../interfaces';
import { useAppDispatch, useAppSelector } from '../redux/app/hooks';
import { initializeAuthorities } from '../redux/features/updateAuthorities/updateAuthoritiesSlice';
import { AuthorityCard } from './cards/AuthorityCard';
import UpdateAuthoritiesConfirmation from './modals/UpdateAuthoritiesConfirmation';

interface IAccountPageProp {
  authorities: Authorities;
}
function AccountPage({ authorities }: IAccountPageProp) {
  const [show, setShow] = useState(false);
  const [display, setDisplay] = useState(false);
  const dispatch = useAppDispatch();
  let isLoggedIn = useReadLocalStorage<boolean>('loginStatus');
  const isOwnerAuthUpdated = useAppSelector(
    (state) => state.updateAuthorities.isOwnerAuthUpdated,
  );
  const isActiveAuthUpdated = useAppSelector(
    (state) => state.updateAuthorities.isActiveAuthUpdated,
  );
  const isPostingAuthUpdated = useAppSelector(
    (state) => state.updateAuthorities.isPostingAuthUpdated,
  );
 
  const [loginState, setLoginState] = useState<boolean>(isLoggedIn);
  useEffect(()=>{
    setLoginState(isLoggedIn);
  },[isLoggedIn])
  
  useEffect(() =>{
    if (authorities) {
      dispatch(initializeAuthorities(authorities));
      setDisplay(true);
    }else{
      setDisplay(false);
    }
  },[authorities])
  

  const handleUpdateBtn = () => {
    if(isOwnerAuthUpdated || isActiveAuthUpdated || isPostingAuthUpdated){
      handleShow();
    }
  }

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return display ? (
    <div>
      <UpdateAuthoritiesConfirmation show={show} handleClose={handleClose}/>
      <Stack gap={3}>
        <AuthorityCard authorityName={'Owner'} authority={authorities.owner} />
        <AuthorityCard
          authorityName={'Active'}
          authority={authorities.active}
        />
        <AuthorityCard
          authorityName={'Posting'}
          authority={authorities.posting}
        />
        {loginState?
        <Stack direction="horizontal" gap={2}>
          <Button className="ms-auto" variant="secondary">
            Reset
          </Button>{' '}
          <Button variant="success" onClick={() => handleUpdateBtn()}>Update</Button>{' '}
        </Stack>:<div></div>}
      </Stack>
    </div>
  ) : (
    <div></div>
  );
}

export default AccountPage;
