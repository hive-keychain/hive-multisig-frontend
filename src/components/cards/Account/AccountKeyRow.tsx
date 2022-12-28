import { FC, useEffect, useState } from "react";
import { Button, Form, InputGroup, Stack } from "react-bootstrap";
import { useAppDispatch } from "../../../redux/app/hooks";
import { deleteAccount, updateAccount } from "../../../redux/features/updateAuthorities/updateAuthoritiesSlice";
import { useDidMountEffect } from "../../../utils/utils";
import { IAccountKeyRowProps } from "../interfaces";

export const AccountKeyRow: FC<IAccountKeyRowProps> = ({
    authorityName,
    type,
    accountKeyAuth,
    componentColor,
  }) =>{
    const [color, setColor] = useState<string>(componentColor);
    const [outlineColor, setOutlineColor] = useState<string>('gray-input-outline')
    const [deleteComponentKey, setDeleteComponentKey] = useState<string>();
    const [weight, setWeight] = useState<number>(accountKeyAuth[1]);
    const [newAuth, setNewAuth] = useState<[string,number]>(accountKeyAuth);
    const dispatch = useAppDispatch();
   
    useEffect(()=>{
      switch(color){
        case 'red':
          setOutlineColor('red-input-outline')
          break;
        case 'blue':
          setOutlineColor('blue-input-outline')
          break;
        default:
          setOutlineColor('gray-input-outline')
          break;
      }
    },[color])

    useDidMountEffect(()=> {
      if (weight !== accountKeyAuth[1]) {
        setColor('blue');
      } else {
        setColor('gray');
      }
      setNewAuth([accountKeyAuth[0],weight]);
    },[weight])
  
    useDidMountEffect(()=>{
      if(newAuth){
        const payload: IAccountKeyRowProps = {
          authorityName,
          type,
          accountKeyAuth: [...newAuth]
        }
        dispatch(updateAccount(payload));
      }
    },[newAuth])
    
    useDidMountEffect(() => {
      if(deleteComponentKey!==''){
        const payload: IAccountKeyRowProps = {
          authorityName,
          type,
          accountKeyAuth: [...newAuth],
        }
        console.log("deleteDispatchPayload: ",payload)
        dispatch(deleteAccount(payload));
        setDeleteComponentKey('');
      }
    },[deleteComponentKey])
    
    const handleUpdate = (v:number) =>{
      setWeight(v);
    }
    const handleDelete = () => {
      setDeleteComponentKey(accountKeyAuth[0]);
    };
  
    return (
      <Stack direction="horizontal" gap={3}>
        <InputGroup className="mb-3 ">
          <InputGroup.Text className={outlineColor} id="basic-addon1">
            {type === 'Accounts' ? (
              '@'
            ) : (
              <i className="fa fa-lock"></i>
            )}
          </InputGroup.Text>
          <Form.Control 
            className={`me-auto ${outlineColor}`}
            type="text"
            placeholder={accountKeyAuth[0].toString()}
            value = {accountKeyAuth[0]}
            readOnly
          />
        </InputGroup>
        <InputGroup className="mb-3">
          <InputGroup.Text className={outlineColor} id="basic-addon1">
            Weight
          </InputGroup.Text>
          <Form.Control
            type= {"number"}
            min="1"
            step="1"
            className={`form-control ${outlineColor}`}
            id="weightInput"
            onChange={(e) => handleUpdate(parseInt(e.target.value))}
            placeholder={weight.toString()}
            value={weight}
          />
        </InputGroup>
          <Button
          className="mb-3"
          variant="outline-danger"
          onClick={() => {
            handleDelete();
          }}>
             Delete
        </Button>
      </Stack>
    );
  }