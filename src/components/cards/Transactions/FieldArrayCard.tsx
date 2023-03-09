import { FieldArray } from "formik";
import { Card, Form, Stack } from "react-bootstrap";
import { AddArrayField, AddArrayFieldType } from "./AddArrayField";
import ArrayField from "./ArrayField";

interface IFieldArrayProp{
    name:string,
    label:string,
    error:string,
    addArrayFieldProps:AddArrayFieldType
    
}
export const FieldArrayCard: React.FC<IFieldArrayProp> = ({
    name,
    label,
    error,
    addArrayFieldProps
}) =>{
    return(
    <Card>
    <Card.Body>
    <Form.Label>{label}</Form.Label>
    <Form.Group>
    <FieldArray name={name} >
        {
            (fieldArrayProps) => {
                const {push, remove, form} = fieldArrayProps;
                const {values} = form;
                let fieldValues:string[] = [];
                if(values[name]){
                    fieldValues = values[name]
                }
                return (
                    <div>
                    <Stack direction="vertical" gap={2}>
                        {
                        fieldValues && fieldValues.length>0?
                        fieldValues.map((auth:string,index:number) => {
                        return (    
                                <ArrayField
                                    key={index} 
                                    remove={remove}
                                    fieldKey={index}
                                    value={auth}
                                    index={index}
                                />
                            )
                        }):<div></div>}
                    <AddArrayField 
                    stateValue={addArrayFieldProps.stateValue}
                    setStateFunc={addArrayFieldProps.setStateFunc}
                    addButtonHandler={addArrayFieldProps.addButtonHandler}
                    pushFunc={push}
                    placeHolder={addArrayFieldProps.placeHolder}
                    />
                    </Stack>
                    {error!==''?<div  style={{ color: 'red' }}>{error}</div>:null}
                    </div>
                );

            }
        }
    </FieldArray> 
    </Form.Group>
    </Card.Body>
    </Card>
    )
}