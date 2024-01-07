import { useAppDispatch, useAppSelector } from '../../redux/app/hooks';
import { AuthenticatorSetup } from '../cards/TwoFactorAuth/AuthenticatorSetup';
import { MultisigTwoFactorAuthSetup } from '../cards/TwoFactorAuth/MultisigTwoFactorAuthSetup';
import { TwoFactorIntro } from '../cards/TwoFactorAuth/TwoFactorIntro';

export const TwoFactorAuthPage = () => {
  const dispatch = useAppDispatch();
  const twoFactorEnabled = useAppSelector(
    (state) => state.twoFactorAuth.twoFactorAuth.enabled,
  );

  const proceedIntro = useAppSelector(
    (state) => state.twoFactorAuth.twoFactorAuth.proceedIntro,
  );
  const proceedMultisig = useAppSelector(
    (state) => state.twoFactorAuth.twoFactorAuth.proceedMultisig,
  );
  //TODO: retrieve custom json to determine if the 2FA is already enabled
  //PROCESS:
  // always show intro
  // when proceed clicked, move to 2fa setup
  // when setup succeed, proceed to multisig setup

  return proceedMultisig ? (
    <MultisigTwoFactorAuthSetup />
  ) : proceedIntro ? (
    <AuthenticatorSetup />
  ) : (
    <TwoFactorIntro />
  );
};
