import { SendBuilderConfigurationContextProvider } from "./SendBuilderConfigurationContextProvider";
import SendSecretBuilderConfigurationFooter from "./SendSecretBuilderConfigurationFooter";
import SendSecretBuilderFieldsEditorContainer from "./SendSecretBuilderFieldsEditorContainer";
import { SendBuilderConfiguration } from "./types";

/**
 * The root component for the secret builder.
 *
 * Manages the state of the builder configuration and renders the fields container and the configuration footer.
 */
export function SendSecretBuilderRoot({
  sendBuilderConfiguration,
}: {
  sendBuilderConfiguration: SendBuilderConfiguration;
}) {
  return (
    <SendBuilderConfigurationContextProvider initialConfig={sendBuilderConfiguration}>
      <div className="border rounded-xl mb-4 shadow-lg">
        <SendSecretBuilderFieldsEditorContainer />
        <SendSecretBuilderConfigurationFooter />
      </div>
    </SendBuilderConfigurationContextProvider>
  );
}
