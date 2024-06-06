import React, { createContext, useContext, useState } from "react";
import { SendBuilderConfiguration } from "./types";

/**
 * The context for the send builder configuration. It provides the current configuration and a function to update it.
 *
 * Note: the updateConfig function is not implemented in this snippet.
 */
const SendBuilderConfigurationContext = createContext<{
  config: SendBuilderConfiguration;
  updateConfig: (updatedConfig: Partial<SendBuilderConfiguration>) => void;
}>({
  config: {
    title: "",
    password: null,
    expirationDate: null,
    confirmationEmail: null,
    maxViews: null,
    fields: [],
  },
  updateConfig: () => {},
});

/**
 * Hook to access the send builder configuration context.
 */
export function useSendBuilderConfiguration() {
  return useContext(SendBuilderConfigurationContext);
}

interface SendBuilderConfigurationContextProviderProps {
  initialConfig: SendBuilderConfiguration;
  children: React.ReactNode;
}

export const SendBuilderConfigurationContextProvider: React.FC<SendBuilderConfigurationContextProviderProps> = ({
  children,
  initialConfig,
}) => {
  const [config, setConfig] = useState(initialConfig);

  return (
    <SendBuilderConfigurationContext.Provider
      value={{
        config,
        updateConfig: (updatedConfig) => {
          const newConfig = {
            ...config,
            ...updatedConfig,
          };

          setConfig(newConfig);
        },
      }}
    >
      {children}
    </SendBuilderConfigurationContext.Provider>
  );
};
