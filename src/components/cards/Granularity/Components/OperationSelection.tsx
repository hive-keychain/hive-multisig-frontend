import { Button, Form, InputGroup } from 'react-bootstrap';
import { OperationName } from '../../../../interfaces/granularity.interface';
export const OperationSelection = () => {
  // Map the enum keys to the corresponding formatted operation names
  const operations = Object.entries(OperationName).map(([key, value]) => ({
    key,
    displayName: value
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' '),
  }));

  return (
    <>
      <Form.Label>Select Operation</Form.Label>
      <InputGroup>
        <Form.Select>
          {operations.map((operation) => (
            <option key={operation.key} value={operation.key}>
              {operation.displayName}
            </option>
          ))}
        </Form.Select>
        <Button variant="outline-primary"> Add</Button>
      </InputGroup>
    </>
  );
};
