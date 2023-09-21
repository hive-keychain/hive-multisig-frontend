import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Col, FloatingLabel, Form, Row } from 'react-bootstrap';
import { IExpiration } from '../../../interfaces/transaction.interface';

interface IExpirationProp {
  setExpiration: Dispatch<SetStateAction<IExpiration>>;
}
export const Expiration = ({ setExpiration }: IExpirationProp) => {
  const [minutes, setMinutes] = useState<number>(10);

  useEffect(() => {
    handleChange();
  }, [minutes]);

  const handleChange = () => {
    setExpiration({ minutes });
  };

  return (
    <div>
      <Form.Label>Expire in</Form.Label>
      <Row className="mb-3" xs="auto">
        <Col xs={3}>
          <FloatingLabel label="Min">
            <Form.Select
              value={minutes}
              onChange={(e) => {
                setMinutes(parseInt(e.target.value));
              }}>
              {Array.from(Array(61).keys()).map((hrs) => {
                return <option key={hrs}>{hrs}</option>;
              })}
            </Form.Select>
          </FloatingLabel>
        </Col>
      </Row>
    </div>
  );
};
