import { Stack } from 'react-bootstrap';
import { Authorities } from '../interfaces';
import { AuthorityCard } from './cards/AuthorityCard';

interface IAccountPageProp{
  authorities:Authorities
}
function AccountPage({authorities}:IAccountPageProp) {
  return (
          authorities?
          <div>
          <Stack gap={3}>
            <AuthorityCard authorityName={'Owner'} authority={authorities.owner}/>
            <AuthorityCard authorityName={'Active'} authority={authorities.active}/>
            <AuthorityCard authorityName={'Posting'} authority={authorities.posting}/>
          </Stack>
        </div>
        :<div></div>
      );
  }



export default AccountPage
