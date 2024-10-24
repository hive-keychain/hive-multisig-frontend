import { KeychainKeyTypes } from 'hive-keychain-commons';
import { Authorities } from '../interfaces';
import {
  MultisigGbotConfig,
  Operation,
} from '../interfaces/granularity.interface';
import HiveUtils from './hive.utils';
const GBOT_CONFIG_ID = process.env.GBOT_CONFIG_ID;
const defaultGBot = process.env.TWOFA_BOT;

const getOperationNames = (
  config: MultisigGbotConfig,
  authority?: string,
): string[] => {
  if (authority) {
    const targetConfiguration = config.json.configurations.find(
      (configuration) => configuration.authority === authority,
    );
    return targetConfiguration
      ? targetConfiguration.operations.map((op) => op.operationName)
      : [];
  }
  return config.json.configurations
    .filter((configuration) => !configuration.authority)
    .flatMap((configuration) =>
      configuration.operations.map((op) => op.operationName),
    );
};

const getOperations = (
  config: MultisigGbotConfig,
  authority?: string,
): Operation[] => {
  if (authority) {
    const targetConfiguration = config.json.configurations.find(
      (configuration) => configuration.authority === authority,
    );
    return targetConfiguration
      ? targetConfiguration.operations.map((op) => op)
      : [];
  }
  return config.json.configurations
    .filter((configuration) => !configuration.authority)
    .flatMap((configuration) => configuration.operations.map((op) => op));
};

const getCustomJsonIds = (
  config: MultisigGbotConfig,
  authority?: string,
): string[] => {
  const operations = getOperations(config, authority);

  const customJsonOp = operations.find(
    (op) => op.operationName === 'custom_json',
  );

  return structuredClone(customJsonOp?.id || []);
};

const updateCustomJsonIds = (
  ids: string[],
  config: MultisigGbotConfig,
  authority?: string,
) => {
  const newConfigurations = config.json.configurations.map((configuration) => {
    const shouldUpdate =
      authority !== undefined
        ? configuration.authority === authority
        : !configuration.authority;

    if (shouldUpdate) {
      const updatedOperations = configuration.operations.map((operation) => {
        if (operation.operationName === 'custom_json') {
          // Update the IDs for the custom_json operation
          return {
            ...operation,
            id: ids,
          };
        }
        return operation;
      });

      return {
        ...configuration,
        operations: updatedOperations,
      };
    }

    return configuration;
  });

  return {
    ...config,
    json: {
      ...config.json,
      configurations: newConfigurations,
    },
  };
};

const moveChangeConfigToCustomJson = (
  config: MultisigGbotConfig,
): MultisigGbotConfig => {
  const configTobeUpdated = structuredClone(config);
  const authorities = getAuthoritiesWithChangeConfig(config);
  const newConfig = removeChangeConfig(configTobeUpdated);

  const updatedConfig = newConfig.json.configurations.map((configuration) => {
    const shouldUpdate =
      (configuration.authority === undefined && authorities.includes('all')) ||
      authorities.includes(configuration.authority);
    if (shouldUpdate) {
      const updatedOperations = (() => {
        let hasCustomJson = false;

        const operationsWithUpdatedIds = configuration.operations.map(
          (operation) => {
            if (operation.operationName === 'custom_json') {
              hasCustomJson = true;
              return {
                ...operation,
                id: [...operation.id, 'multisig-gbot-config'],
              };
            }
            return operation;
          },
        );

        // If no 'custom_json' operation was found, add it
        if (!hasCustomJson) {
          return [
            ...operationsWithUpdatedIds,
            {
              operationName: 'custom_json',
              id: ['multisig-gbot-config'],
            },
          ];
        }

        return operationsWithUpdatedIds;
      })();

      return { ...configuration, operations: updatedOperations };
    }
    return configuration;
  });

  return { ...config, json: { configurations: updatedConfig } };
};

const getAuthoritiesWithChangeConfig = (
  config: MultisigGbotConfig,
): string[] => {
  const authorities: string[] = [];

  config.json.configurations.forEach((configuration) => {
    // Check if the configuration contains an operation with "change_config"
    const hasChangeConfig = configuration.operations.some(
      (operation) => operation.operationName === 'change_config',
    );

    if (hasChangeConfig) {
      // Add the authority to the list, or "all" if there's no authority
      authorities.push(configuration.authority ?? 'all');
    }
  });

  return authorities;
};

const removeChangeConfig = (config: MultisigGbotConfig): MultisigGbotConfig => {
  const updatedConfigurations = config.json.configurations.map(
    (configuration) => {
      // Filter out the change_config operation from the operations
      const updatedOperations = configuration.operations.filter(
        (operation) => operation.operationName !== 'change_config',
      );

      // Return the updated configuration
      return {
        ...configuration,
        operations: updatedOperations,
      };
    },
  );

  // Return the updated config object
  return {
    ...config,
    json: {
      ...config.json,
      configurations: updatedConfigurations,
    },
  };
};

const getBotAuthorities = (
  bots: { botName: string; type: string; keyType: string }[],
  newAuthorities: Authorities,
) => {
  return newAuthorities.active.account_auths.filter((acc) =>
    bots.some((bot) => bot.botName === acc[0]),
  );
};

const getAuthorityNameList = (config: MultisigGbotConfig): string[] => {
  return config.json.configurations
    .filter((configuration) => configuration.authority)
    .map((configuration) => configuration.authority);
};

const addAllUserOp = (operation: Operation, config: MultisigGbotConfig) => {
  const newConfigurations = config.json.configurations.map((configuration) => {
    if (!configuration.authority) {
      if (operation.operationName === 'all') {
        return {
          ...configuration,
          operations: [operation],
        };
      } else {
        return {
          ...configuration,
          operations: [...configuration.operations, operation],
        };
      }
    }
    return configuration;
  });

  return {
    ...config,
    json: {
      ...config.json,
      configurations: newConfigurations,
    },
  };
};

const deleteAllUserOp = (operation: Operation, config: MultisigGbotConfig) => {
  const newConfigurations = config.json.configurations.map((configuration) => {
    if (!configuration.authority) {
      return {
        ...configuration,
        operations: configuration.operations.filter(function (op) {
          return op.operationName !== operation.operationName;
        }),
      };
    }
    return configuration;
  });

  return {
    ...config,
    json: {
      ...config.json,
      configurations: newConfigurations,
    },
  };
};

const checkGranularityBot = async (username: string) => {
  const metadata = await HiveUtils.getJSONMetadata(username);
  return metadata?.isGranularityBot === true ? true : false;
};

const getGranularityBots = async (username: string) => {
  try {
    const activeAuth = await HiveUtils.getAuthority(
      username,
      KeychainKeyTypes.active,
    );
    const postingAuth = await HiveUtils.getAuthority(
      username,
      KeychainKeyTypes.posting,
    );
    let bots: { botName: string; type: string; keyType: string }[] = [];

    // Check activeAuth for bots
    for (const [botName] of activeAuth.account_auths) {
      const isBot = await checkGranularityBot(botName);
      if (isBot) {
        bots.push({
          botName: botName,
          type: botName === defaultGBot ? 'default' : 'custom',
          keyType: 'active',
        });
      }
    }

    // Check postingAuth for bots
    for (const [botName] of postingAuth.account_auths) {
      const isBot = await checkGranularityBot(botName);
      if (isBot) {
        bots.push({
          botName: botName,
          type: botName === defaultGBot ? 'default' : 'custom',
          keyType: 'posting',
        });
      }
    }

    // Return undefined if no bots found, otherwise return the list of bots
    return bots.length > 0 ? bots : undefined;
  } catch (error) {
    console.error(`Error fetching multisig bots for ${username}:`, error);
    throw error;
  }
};
const addAuthority = (authority: string, config: MultisigGbotConfig) => {
  const newConfigurations = [
    ...config.json.configurations,
    {
      authority: authority,
      operations: [],
    },
  ];

  return {
    ...config,
    json: {
      ...config.json,
      configurations: newConfigurations,
    },
  };
};

const removeAuthority = (authority: string, config: MultisigGbotConfig) => {
  const newConfigurations = config.json.configurations.filter(
    (configuration) => configuration.authority !== authority,
  );

  return {
    ...config,
    json: {
      ...config.json,
      configurations: newConfigurations,
    },
  };
};
const addOpToAuthority = (
  authority: string,
  operation: Operation,
  config: MultisigGbotConfig,
) => {
  const newConfigurations = config.json.configurations.map((configuration) => {
    if (configuration.authority === authority) {
      if (operation.operationName === 'all') {
        // Replace all existing operations with the new 'all' operation
        return {
          ...configuration,
          operations: [operation],
        };
      } else {
        // Add the new operation to the existing list
        return {
          ...configuration,
          operations: [...configuration.operations, operation],
        };
      }
    }
    return configuration;
  });

  return {
    ...config,
    json: {
      ...config.json,
      configurations: newConfigurations,
    },
  };
};

const deleteOpFromAuthority = (
  authority: string,
  operation: Operation,
  config: MultisigGbotConfig,
) => {
  const newConfigurations = config.json.configurations.map((configuration) => {
    if (configuration.authority === authority) {
      return {
        ...configuration,
        operations: configuration.operations.filter(
          (op) => op.operationName !== operation.operationName,
        ),
      };
    }
    return configuration;
  });

  return {
    ...config,
    json: {
      ...config.json,
      configurations: newConfigurations,
    },
  };
};

export const GranularityUtils = {
  getOperationNames,
  getOperations,
  getAuthorityNameList,
  getCustomJsonIds,
  updateCustomJsonIds,
  addAuthority,
  removeAuthority,
  addOpToAuthority,
  addAllUserOp,
  deleteAllUserOp,
  deleteOpFromAuthority,
  moveChangeConfigToCustomJson,
  getBotAuthorities,
  getGranularityBots,
  checkGranularityBot,
};
