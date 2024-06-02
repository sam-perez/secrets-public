import SecretBuilderConfigurationFooter from "./SecretBuilderConfigurationFooter";
import SecretBuilderFieldsContainer from "./SecretBuilderFieldsContainer";
import { SendBuilderConfiguration } from "./types";

/**
 * The root component for the secret builder.
 *
 * Manages the state of the builder configuration and renders the fields container and the configuration footer.
 */
export function SecretBuilderRoot({
  sendBuilderConfiguration,
}: {
  sendBuilderConfiguration: SendBuilderConfiguration;
}) {
  return (
    <div className="border rounded-xl mb-4 shadow-lg">
      <SecretBuilderFieldsContainer sendBuilderConfiguration={sendBuilderConfiguration} />
      <SecretBuilderConfigurationFooter />
    </div>
  );
}
