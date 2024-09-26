import { useAppSelector } from '../../../redux/app/hooks';
import { AuthorityCard } from '../Account/AuthorityCard';
const defaultBot = process.env.TWOFA_BOT;

export interface TwoFATabProp {
  isManageTwoFA: boolean;
}
export const DefaultTwoFactorAuthSetup = ({ isManageTwoFA }: TwoFATabProp) => {
  const hasDefaultBot = useAppSelector(
    (state) => state.twoFactorAuth.twoFactorAuth.hasDefaultBot,
  );
  return (
    <div>
      {isManageTwoFA ? (
        <p className="justify-content-md-center">
          Removing the default bot <strong>@{`${defaultBot}`}</strong> will
          automatically reduce the threshold by its weight.
        </p>
      ) : (
        <div className="mb-2">
          <p className="justify-content-md-center">
            Threshold must be at least equal to 2 for the 2FA to work properly.
          </p>
          {hasDefaultBot ? (
            <div>
              <strong>{`@${defaultBot}`}</strong>
              {' is already added in your account.'}
            </div>
          ) : (
            <div>
              The 2FA bot
              <strong>{` @${defaultBot}`}</strong>
              {` will be added to your active authorities and the weight threshold will be increased by 1.`}
            </div>
          )}
        </div>
      )}
      <div>
        <AuthorityCard authorityName="Active" />
      </div>
    </div>
  );
};
