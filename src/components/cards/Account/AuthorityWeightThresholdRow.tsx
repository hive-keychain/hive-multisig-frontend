import { useEffect, useState } from "react";
import { Form, InputGroup } from "react-bootstrap";
import { useReadLocalStorage } from "usehooks-ts";
import { IAccountKeyRowProps } from "../../../interfaces/cardInterfaces";
import { useAppDispatch } from "../../../redux/app/hooks";
import { updateAccount } from "../../../redux/features/updateAuthorities/updateAuthoritiesSlice";
import { useDidMountEffect } from "../../../utils/utils";

export function AuthorityWeightThreshold({authorityName, type, threshold}: IAccountKeyRowProps) {
    const dispatch = useAppDispatch();
    const [weight, setNewWeightThresh] = useState<number>(threshold);
    const [editFlag, setEdiFlag] = useState<string>('text-body');
    let isLoggedIn = useReadLocalStorage<boolean>('loginStatus');
    const [loginState, setLoginState] = useState<boolean>(isLoggedIn);
    useEffect(()=>{
      setLoginState(isLoggedIn);
    },[isLoggedIn])
    
    useDidMountEffect(() => {
      if (weight !== threshold) {
        setEdiFlag('text-danger');
      } else {
        setEdiFlag('text-body');
      }
      const payload:IAccountKeyRowProps ={
        authorityName,
        type,
        threshold: weight
      }
      dispatch(updateAccount(payload));
    }, [weight]);
  
    return (
      <div>
        <InputGroup className="mb-3">
          <InputGroup.Text className={editFlag} id="basic-addon1">
            Weight Threshold
          </InputGroup.Text>
          <Form.Control
            type={"number"}
            min="1"
            step="1"
            className="form-control"
            id="threshInput"
            onChange={(e) => {
              setNewWeightThresh(parseInt(e.target.value));
            }}
            placeholder={weight.toString()}
            value={weight}
          />
        </InputGroup>
      </div>
    );
  }