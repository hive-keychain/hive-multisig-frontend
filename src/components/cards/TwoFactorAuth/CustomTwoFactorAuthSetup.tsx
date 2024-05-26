import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../../redux/app/hooks';
import { AuthorityCard } from '../Account/AuthorityCard';
import { MultisigTwoFAHooks } from './Multisig2FAHooks';
const defaultBot = process.env.BOT;

export const CustomTwoFactorAuthSetup = () => {
  const [originalActive, newActive] = MultisigTwoFAHooks.useActiveAuthority();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  return (
    <div>
      <div>
        <p className="justify-content-md-center">
          {' '}
          To complete the Two Factor Authentication setup, it is required to add
          a multisig bot account in your account authorities.
        </p>
        <p className="justify-content-md-center">
          Add the username of the bot below and make sure to set the proper
          weight and threshold.
        </p>
        <p className="justify-content-md-center">
          Threshold must be at least equal to 2 for the 2FA to work properly.
        </p>
      </div>
      <div>
        <AuthorityCard authorityName="Active" />
      </div>
    </div>
  );
};
