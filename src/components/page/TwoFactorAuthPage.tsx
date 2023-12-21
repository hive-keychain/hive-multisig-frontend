import { authenticator } from '@otplib/preset-browser';
import { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../../redux/app/hooks';
import {
  createQRCode,
  createSecret,
  setTokenValidation,
} from '../../redux/features/twoFactorAuth/twoFactorAuthThunks';
import { base64ToImage } from '../../utils/utils';

export const TwoFactorAuthPage = () => {
  const twoFactorEnabled = useAppSelector(
    (state) => state.twoFactorAuth.twoFactorAuth.enabled,
  );

  //TODO: retrieve custom json to determine if the 2FA is already enabled

  return <div>{twoFactorEnabled ? <div /> : <TwoFactorSetup />}</div>;
};

const TwoFactorSetup = () => {
  const signedAccountObj = useAppSelector((state) => state.login.accountObject);

  const secret = useAppSelector(
    (state) => state.twoFactorAuth.twoFactorAuth.secret,
  );
  const qrCodeUrl = useAppSelector(
    (state) => state.twoFactorAuth.twoFactorAuth.qrCodeUrl,
  );
  const twoFactorEnabled = useAppSelector(
    (state) => state.twoFactorAuth.twoFactorAuth.enabled,
  );
  const tokenValidation = useAppSelector(
    (state) => state.twoFactorAuth.twoFactorAuth.isValid,
  );

  const [qrCodeImage, setQrCodeImage] = useState<HTMLImageElement>(undefined);
  const [token, setOtp] = useState<string>(undefined);
  const [validToken, setValidToken] = useState<boolean>(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!twoFactorEnabled) {
      try {
        const secret = authenticator.generateSecret(32).toString();
        dispatch(createSecret(secret));
      } catch (e) {
        console.error(e);
      }
    }
  }, [twoFactorEnabled]);

  useEffect(() => {
    if (secret && signedAccountObj) {
      const otpauth = authenticator.keyuri(
        signedAccountObj.data.username,
        'hive-multisig',
        secret,
      );
      dispatch(createQRCode(otpauth));
    }
  }, [secret]);

  useEffect(() => {
    if (qrCodeUrl) {
      setQrCodeImage(base64ToImage(qrCodeUrl));
    }
  }, [qrCodeUrl]);

  useEffect(() => {
    setValidToken(tokenValidation);
  }, [tokenValidation]);
  const handleOTPValidation = () => {
    const isValid = authenticator.check(token, secret);
    dispatch(setTokenValidation(isValid));
    console.log(`Result:${isValid}`);
  };
  return (
    <div>
      <div>
        {qrCodeImage && (
          <div>
            <img src={qrCodeImage.src} alt="QR Code" />
          </div>
        )}
        {`Copy your secret: ${secret}`}
        <br />
        {'Scan QR using Google Authenticator App'}
      </div>

      <div>
        <br />

        <Form.Group className="mb-3">
          {validToken ? 'Success!' : ''}
          <br />
          <Form.Label>Enter OTP from Google Authenticator</Form.Label>
          <Form.Control
            type="otp"
            placeholder="OTP"
            onChange={(e) => {
              setOtp(e.target.value);
            }}
          />
        </Form.Group>
        <Button
          variant="primary"
          onClick={() => {
            handleOTPValidation();
          }}>
          Validate
        </Button>
      </div>
    </div>
  );
};
