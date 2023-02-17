import { useEffect, useState } from 'react';
import { Col, FloatingLabel, Form, Row } from 'react-bootstrap';

interface IExpirationProp {
  setExpiration: Function;
}
export const Expiration = ({ setExpiration }: IExpirationProp) => {
  const [days, setDay] = useState<number>(0);
  const [hours, setHour] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);

  useEffect(() => {
    handleChange();
  }, [days, hours, minutes]);
  const handleChange = () => {
    setExpiration({
      days: days,
      hours: hours,
      minutes: minutes,
    });
  };

  return (
    <div>
      <Form.Label>Expiration</Form.Label>
      <Row className="mb-3" xs="auto">
        <Col xs={3}>
          <FloatingLabel label="Day" className="mb-3">
            <Form.Control
              type="number"
              value={days}
              onChange={(e) => {
                setDay(parseInt(e.target.value));
              }}
            />
          </FloatingLabel>
        </Col>
        <Col xs={3}>
          <FloatingLabel label="Hour">
            <Form.Select
              value={hours}
              onChange={(e) => {
                setHour(parseInt(e.target.value));
              }}>
              {Array.from(Array(24).keys()).map((hrs) => {
                if (hrs !== 24) {
                  if (hrs === 0) {
                    return <option key={hrs}>{hrs}</option>;
                  } else {
                    return <option key={hrs + 1}>{hrs + 1}</option>;
                  }
                }
              })}
            </Form.Select>
          </FloatingLabel>
        </Col>
        <Col xs={3}>
          <FloatingLabel label="Min">
            <Form.Select
              value={minutes}
              onChange={(e) => {
                setMinutes(parseInt(e.target.value));
              }}>
              {Array.from(Array(61).keys()).map((hrs) => {
                if (hrs !== 60) {
                  if (hrs === 0) {
                    return <option key={hrs}>{hrs}</option>;
                  } else {
                    return <option key={hrs + 1}>{hrs + 1}</option>;
                  }
                }
              })}
            </Form.Select>
          </FloatingLabel>
        </Col>
      </Row>
    </div>
  );
};
