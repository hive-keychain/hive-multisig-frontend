import { useEffect, useState } from "react";
import { Form, InputGroup, Row } from "react-bootstrap";

interface IInputRow {
    rowKey: string,
    label: string,
    prepend?:string,
    append?:string,
    rowName: string,
    type?: string,
    as?: any|string,
    select?:string[],
    selectionHandler?:Function,
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
    append,
    rowName,
    type,
    as,
    select,
    selectionHandler,
    placeholder,
    value,
    onChangeFunc,
    invalidFlag,
    error
}:IInputRow) =>{
    const [selection, setSelection] = useState<string>('');

    useEffect(()=>{
        if(select && selection.length >0){
            setSelection(selection[0])
        }
    },[])

    useEffect(()=>{
        if(selection){
            selectionHandler(selection)
        }
    },[selection])
    const handleSelectionChange = (value:string) => {
        setSelection(value);
    }
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
            {append && append!==''?<InputGroup.Text id="inputGroupAppend">{append}</InputGroup.Text>:null}
            {select && select.length>0?
                <Form.Select value={selection} onChange={e => handleSelectionChange(e.target.value) } aria-label="select" >
                    {
                        select.map((item:string,index:number) => {
                            return (
                                <option 
                                key={item}
                                value={item}
                                >{item}</option> 
                            )
                        })
                    }
                </Form.Select>
            :null
            }

          
            <Form.Control.Feedback type="invalid">{String(error)}</Form.Control.Feedback>
        </InputGroup>
        </Form.Group>
        </Row>
        </div>

    )
}