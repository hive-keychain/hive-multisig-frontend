import {
  MultisigGbotConfig,
  Operation,
} from '../interfaces/granularity.interface';
const GBOT_CONFIG_ID = process.env.GBOT_CONFIG_ID;

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

const moveChangeConfigToCustomJson = (config: MultisigGbotConfig) => {};

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
};
