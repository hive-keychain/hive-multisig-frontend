export type ErrorMessage = {
  Title: string;
  Code: string;
  ErrorName: string;
  ErrorMessage: string;
};
export interface ErrorProps {
  show: boolean;
  setShow: Function;
  error: ErrorMessage;
}
