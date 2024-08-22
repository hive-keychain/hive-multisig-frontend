import { OperationRow } from './OperationRow';

export const AllUsersConfig = () => {
  return (
    <div>
      <OperationRow operation={'Transfer'} key={'1'} />
      <OperationRow operation={'Sign Buffer'} key={'1'} />
      <OperationRow operation={'Custom JSON'} key={'1'} />
    </div>
  );
};
