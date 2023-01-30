import { Button, Container, Form, Stack } from "react-bootstrap"

export type AddArrayFieldType = {
    stateValue:string,
    placeHolder:string,
    setStateFunc:Function,
    addButtonHandler:Function

}

interface IAddArrayField{
    stateValue:string,
    placeHolder:string,
    setStateFunc:Function,
    addButtonHandler:Function
    pushFunc:Function
}
export const AddArrayField: React.FC<IAddArrayField> = (
    {
        stateValue,setStateFunc,addButtonHandler,pushFunc,placeHolder
    }
) =>{

    return(
        <Container fluid>
        <Stack direction="horizontal" gap={3}>
            <Form.Control
            className='gray-input-outline'
            type='text'
            placeholder={placeHolder}
            value={stateValue}
            onChange = {(e) => setStateFunc(e.target.value)}
            />
            <Button
            type='button'
            className='txn-crd-btn'
            variant="success"
            onClick={ () => {addButtonHandler(pushFunc)}}
            >
            Add
            </Button>
        </Stack>
        </Container>
    )
}