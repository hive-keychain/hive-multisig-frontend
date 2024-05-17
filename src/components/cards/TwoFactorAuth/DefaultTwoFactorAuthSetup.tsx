import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../redux/app/hooks';
import { AuthorityCard } from '../Account/AuthorityCard';
const defaultBot = process.env.BOT;
export const DefaultTwoFactorAuthSetup = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const hasDefaultBot = useAppSelector(
    (state) => state.twoFactorAuth.twoFactorAuth.hasDefaultBot,
  );
  return (
    <div>
      <div className="mb-2">
        {hasDefaultBot ? (
          <div>
            <strong>{`@${defaultBot}`}</strong>
            {' is already added in your account.'}
          </div>
        ) : (
          <div>
            <strong>
              <strong>{`@${defaultBot}`}</strong>
            </strong>
            {` will be added to your active authorities and the weight threshold will be increased by 1.`}
          </div>
        )}
      </div>
      <div>
        <AuthorityCard authorityName="Active" />
      </div>
    </div>
  );
};
