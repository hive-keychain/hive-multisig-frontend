import { Client } from '@hiveio/dhive';
import { HiveUtils } from 'hive-multisig-sdk/src/utils/hive.utils';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Col, FloatingLabel, Form, Row } from 'react-bootstrap';
import { IExpiration } from '../../../interfaces/transaction.interface';

interface IExpirationProp {
  setExpiration: Dispatch<SetStateAction<IExpiration>>;
}
export const Expiration = ({ setExpiration }: IExpirationProp) => {
  const [minutes, setMinutes] = useState<number>(10);
  const [hours, setHours] = useState<number>(0);
  const [supportsAboveOneHour, setSupportsAboveOneHour] =
    useState<boolean>(false);

  useEffect(() => {
    console.log('hi');
    HiveUtils.getCurrentVersion().then((version) => {
      console.log('versions', version);
    });
  }, []);
  useEffect(() => {
    // Use dhive to query condenser.get_hardfork_version and gate >1h options by HF >= 28
    const client = new Client([
      'https://api.hive.blog',
      'https://api.hivekings.com',
      'https://api.deathwing.me',
      'https://anyx.io',
      'https://api.openhive.network',
    ]);
    client
      .call('condenser_api', 'get_hardfork_version', [])
      .then((version: string) => {
        const parts = String(version).split('.');
        const hf = parseInt(parts[1] || '0', 10);
        const isSupported = hf >= 28;
        setSupportsAboveOneHour(isSupported);
        if (!isSupported && hours > 1) {
          setHours(1);
        }
      })
      .catch(() => {
        setSupportsAboveOneHour(false);
        if (hours > 1) setHours(1);
      });
  }, []);
  useEffect(() => {
    if (hours === 24 && minutes !== 0) {
      setMinutes(0);
    }
    if (!supportsAboveOneHour && hours === 1 && minutes !== 0) {
      setMinutes(0);
    }
  }, [hours, supportsAboveOneHour]);

  useEffect(() => {
    handleChange();
  }, [minutes, hours]);

  const handleChange = () => {
    const totalMinutes = hours * 60 + minutes;
    setExpiration({ minutes: totalMinutes });
  };
  const hourOptions = supportsAboveOneHour
    ? Array.from(Array(25).keys())
    : [0, 1];

  return (
    <div>
      <Form.Label>Expire in</Form.Label>
      <Row className="mb-3" xs="auto">
        <Col xs={3}>
          <FloatingLabel label="Hours">
            <Form.Select
              value={hours}
              onChange={(e) => {
                setHours(parseInt(e.target.value));
              }}>
              {hourOptions.map((hr) => {
                return (
                  <option key={hr} value={hr}>
                    {hr}
                  </option>
                );
              })}
            </Form.Select>
          </FloatingLabel>
        </Col>
        <Col xs={3}>
          <FloatingLabel label="Min">
            <Form.Select
              disabled={hours === 24 || (!supportsAboveOneHour && hours === 1)}
              value={minutes}
              onChange={(e) => {
                setMinutes(parseInt(e.target.value));
              }}>
              {[0, 1, 2, 5, 10, 15, 20, 30, 40, 50].map((min) => {
                return (
                  <option key={min} value={min}>
                    {min}
                  </option>
                );
              })}
            </Form.Select>
          </FloatingLabel>
        </Col>
      </Row>
    </div>
  );
};
