/**
 * By default, Remix will handle hydrating your app on the client for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again,
 * you can run `npx remix reveal` ✨
 *
 * For more information, see https://remix.run/file-conventions/entry.client
 */

/**
 * Strict mode was giving us weird behavior because we kick off some stateful updates to the backend when
 * some components mount. Since strict mode causes some components to mount twice, we were seeing some
 * handshakes firing multiple times, specifically with the SecretSender component, which handles the encryption
 * and upload of the encrypted parts. Perhaps we should refactor this so that this is essentially a call into
 * a function that maintains its own state and reports progress back to whoever is interested?
 *
 * Include this if you want to use strict mode:
 *
 * import { startTransition, StrictMode } from "react";
 * ...
 *
 * startTransition(() => {
 *   hydrateRoot(
 *     document,
 *     <StrictMode>
 *       <RemixBrowser />
 *     </StrictMode>
 *   );
 * });
 */

import { RemixBrowser } from "@remix-run/react";
import { startTransition } from "react";
import { hydrateRoot } from "react-dom/client";

startTransition(() => {
  hydrateRoot(document, <RemixBrowser />);
});
