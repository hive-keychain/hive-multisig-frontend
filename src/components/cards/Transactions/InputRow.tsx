import { Form, InputGroup, Row } from "react-bootstrap"

interface IInputRow {
    rowKey: string,
    label: string,
    prepend?:string,
    rowName: string,
    type?: string,
    as?: any|string,
    placeholder: string,
    value: string|number,
    onChangeFunc: React.ChangeEventHandler,
    invalidFlag: boolean,
    error:string
}

export const InputRow = ({
    rowKey,
    label,
    prepend,
    rowName,
    type,
    as,
    placeholder,
    value,
    onChangeFunc,
    invalidFlag,
    error
}:IInputRow) =>{

    return (
        <div key = {rowKey}>
        <Row className='mb-3'>
        <Form.Group>
        <Form.Label>{label}</Form.Label>
        <InputGroup hasValidation>
            {prepend && prepend!==''?<InputGroup.Text id="inputGroupPrepend">{prepend}</InputGroup.Text>:null}
            <Form.Control
            type={type}
            as={as}
            name={rowName}
            placeholder={placeholder}
            value={String(value)}
            onChange={onChangeFunc}
            isInvalid={invalidFlag}
            />
            <Form.Control.Feedback type="invalid">{String(error)}</Form.Control.Feedback>
        </InputGroup>
        </Form.Group>
        </Row>
        </div>

    )
}