export enum SocketMessageCommand {
  SIGNER_CONNECT = 'signer_connect',
  REQUEST_SIGNATURE = 'request_signature',
  REQUEST_SIGN_TRANSACTION = 'request_sign_transaction',
  SIGN_TRANSACTION = 'sign_transaction',
  REQUEST_LOCK = 'request_lock',
  NOTIFY_TRANSACTION_BROADCASTED = 'notify_transaction_broadcasted',
  TRANSACTION_BROADCASTED_NOTIFICATION = 'transaction_broadcasted_notification',
}
