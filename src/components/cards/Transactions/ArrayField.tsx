import { Button, Container, Form, Stack } from 'react-bootstrap';

interface IArrayFieldProp {
  remove: Function;
  fieldKey: string | number;
  value: string;
  index: number;
}
const ArrayField: React.FC<IArrayFieldProp> = ({
  remove,
  fieldKey,
  value,
  index,
}) => {
  return (
    <Container key={fieldKey} fluid>
      <Stack direction="horizontal" gap={3}>
        <Form.Control className="gray-input-outline" value={value} readOnly />

        <Button
          className="txn-crd-btn"
          variant="outline-danger"
          onClick={() => {
            remove(index);
          }}>
          Delete
        </Button>
      </Stack>
    </Container>
  );
};

export default ArrayField;
