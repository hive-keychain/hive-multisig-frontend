import { MultisigGbotConfig } from "./src/interfaces/granularity.interface";

export const testConfig = {
  id: 'multisig-gbot-config',
  json: {
    configurations: [
      {
        authority: `hrdcr-hive`,
        operations: [{ operationName: 'all' }],
      },
      {
        authority: 'choibounge',
        operations: [
          { operationName: 'transfer' },
          { operationName: 'custom_json', id: ['test_id', 'b'] },
          { operationName: 'delegate_vesting_shares' },
        ],
      },
      {
        operations: [
          { operationName: 'vote' },
          { operationName: 'comment' },
          { operationName: 'custom_json', id: ['test_id', 'c'] },
        ],
      },
    ],
  },
} as MultisigGbotConfig;
