import {
  MultisigGbotConfig,
  Operation,
} from '../interfaces/granularity.interface';

const getOps = (config: MultisigGbotConfig, authority?: string): string[] => {
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

const getAuthorityList = (config: MultisigGbotConfig): string[] => {
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
  const newConfigurations = config.json.configurations.map(function (
    configuration,
  ) {
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
  getOps,
  getAuthorityList,
  addAuthority,
  removeAuthority,
  addOpToAuthority,
  addAllUserOp,
  deleteAllUserOp,
  deleteOpFromAuthority,
};
