import { Button, Stack } from 'react-bootstrap';
import { Authorities } from '../interfaces';
import { useAppDispatch } from '../redux/app/hooks';
import { initializeAuthorities } from '../redux/features/updateAuthorities/updateAuthoritiesSlice';
import { AuthorityCard } from './cards/AuthorityCard';

interface IAccountPageProp {
  authorities: Authorities;
}
function AccountPage({ authorities }: IAccountPageProp) {
  const dispatch = useAppDispatch();

  if (authorities) {
    dispatch(initializeAuthorities(authorities));
  }
  return authorities ? (
    <div>
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
        <Stack direction="horizontal" gap={2}>
          <Button className="ms-auto" variant="secondary">
            Reset
          </Button>{' '}
          <Button variant="success">Update</Button>{' '}
        </Stack>
      </Stack>
    </div>
  ) : (
    <div></div>
  );
}

export default AccountPage;
