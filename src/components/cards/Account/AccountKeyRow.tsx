import { FC, useState } from "react";
import { Button, Form, InputGroup, Stack } from "react-bootstrap";
import { useAppDispatch } from "../../../redux/app/hooks";
import { deleteAccount, updateAccount } from "../../../redux/features/updateAuthorities/updateAuthoritiesSlice";
import { useDidMountEffect } from "../../../utils/utils";
import { IAccountKeyRowProps } from "../interfaces";

export const AccountKeyRow: FC<IAccountKeyRowProps> = ({
    authorityName,
    type,
    accountKeyAuth,
  }) =>{
    const [editFlag, setEdiFlag] = useState<string>('text-body');
    const [deleteComponentKey, setDeleteComponentKey] = useState<string>();
    const [weight, setWeight] = useState<number>(accountKeyAuth[1]);
    const [newAuth, setNewAuth] = useState<[string,number]>(accountKeyAuth);
    const dispatch = useAppDispatch();
   
  
    useDidMountEffect(()=> {
      if (weight !== accountKeyAuth[1]) {
        setEdiFlag('text-danger');
      } else {
        setEdiFlag('text-body');
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
          <InputGroup.Text id="basic-addon1">
            {type === 'Accounts' ? (
              '@'
            ) : (
              <i className="fa fa-lock"></i>
            )}
          </InputGroup.Text>
          <Form.Control
            className="me-auto "
            type="text"
            placeholder={accountKeyAuth[0].toString()}
            value = {accountKeyAuth[0]}
            readOnly
          />
        </InputGroup>
        <InputGroup className="mb-3">
          <InputGroup.Text className={editFlag} id="basic-addon1">
            Weight
          </InputGroup.Text>
          <Form.Control
            type= {"number"}
            min="1"
            step="1"
            className="form-control"
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