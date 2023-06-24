import * as Hive from '@hiveio/dhive';
import { Form, InputGroup, Row } from 'react-bootstrap';
import { useAppDispatch } from '../../../redux/app/hooks';
import { setSigner } from '../../../redux/features/transaction/transactionThunks';

interface ISignerRow {
  name: string | Hive.PublicKey;
  weight: number;
}

export const SignerRow = (signer: ISignerRow) => {
  const _signer = signer;
  const dispatch = useAppDispatch();
  const handleSubmit = () => {
    dispatch(setSigner(_signer.name));
  };
  return (
    <Row className="align-items-center">
      <InputGroup className="w-md-50 mb-2">
        {!_signer.name.toString().includes('STM', 0) ? (
          <InputGroup.Text id="basic-addon1">@</InputGroup.Text>
        ) : null}
        <Form.Control
          placeholder="Username"
          aria-label="Username"
          aria-describedby="basic-addon1"
          value={_signer.name.toString()}
          readOnly
        />
      </InputGroup>
    </Row>
  );
};
