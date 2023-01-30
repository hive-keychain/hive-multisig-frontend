import { useState } from "react"
import { Button, Container, Form, InputGroup, Stack } from "react-bootstrap"



interface IExtensionRowProps {
    extension:string
    handleDelete:Function
}
interface IAddExtensionRowProps{
    handleAdd:Function
}
export const ExtensionRow: React.FC<IExtensionRowProps> = ({extension, handleDelete}) => {
    return(
        <Container fluid>
            <Stack direction="horizontal" gap={3}>
                <InputGroup>
                <InputGroup.Text>@</InputGroup.Text>
                <Form.Control
                className='gray-input-outline'
                value={String(extension)}
                readOnly
                />
                </InputGroup>
                <Button
                key='addExtensionBtn'
                type='button'
                className='txn-crd-btn'
                variant="outline-danger"
                onClick={() => {
                  handleDelete(extension);
                }}>
                  Delete
              </Button>
            </Stack>
        </Container>
    )
}

export const AddExtensionRow: React.FC<IAddExtensionRowProps> = ({handleAdd}) =>{
    const[extensionString, setExtensionString] = useState<string>('')
    
    const onAddBtnClicked = () =>{
        if(extensionString && extensionString!==''){
            handleAdd(extensionString);
            setExtensionString('');
        }
    }
    return(
        <Container fluid>
        <Stack direction="horizontal" gap={3}>
                <InputGroup>
                <InputGroup.Text>@</InputGroup.Text>
                <Form.Control
                className='gray-input-outline'
                type='text'
                placeholder='Username'
                value={extensionString}
                onChange={(e) => {setExtensionString(e.target.value)}}
                />
                </InputGroup>
                <Button
                type='button'
                className='txn-crd-btn'
                variant="success"
                onClick={ () => {onAddBtnClicked()}}
                >
                Add
                </Button>
        </Stack>
        </Container>      
    )
}

