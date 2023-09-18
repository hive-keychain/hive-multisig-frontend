import { FC } from "react";
import { Form, InputGroup } from "react-bootstrap";
import { IAccountKeyRowProps } from "../../../interfaces/cardInterfaces";


export const SearchAuthorityWeightThresholdRow: FC<IAccountKeyRowProps> = ({authorityName, type, threshold}) =>{
    return (
        <div>
          <InputGroup className="mb-3">
            <InputGroup.Text className={'text-body'} id="basic-addon1">
              Weight Threshold
            </InputGroup.Text>
            <Form.Control
              type={"text"}
              min="1"
              step="1"
              className="form-control"
              id="threshInput"
              placeholder={threshold.toString()}
              value={threshold}
              readOnly
            />
          </InputGroup>
        </div>
      );
}