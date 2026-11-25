import { useCallback, useEffect } from 'react';

import { releaseNotes, version } from '../../../../package.json';
import { store } from '../store/store';
import isLatestVersion from '../utils/isLatestVersion';
import { parseChangelog } from '../utils/parseChangelog';

/** Dependencies required by the useAppUpdates hook. */
export interface AppUpdatesDependencies {
  /** Whether the app is currently online */
  isOnline: boolean;
}

/**
 * Custom hook to manage application update checking and notifications.
 *
 * This hook:
 *
 * - Checks for app updates on startup (after 5 seconds)
 * - Periodically checks for updates (every 15 minutes)
 * - Fetches latest version info from remote changelog
 * - Compares local version with remote version
 * - Updates app update state in the store
 * - Handles network errors gracefully
 *
 * The check is silent: it never opens the release notes by itself. The title bar
 * update indicator is the only startup-facing signal that an update exists; the
 * release notes prompt opens when the user clicks that indicator.
 *
 * Update states:
 *
 * - CHECKING: Currently checking for updates
 * - LATEST: App is up-to-date
 * - OLD: Update available
 * - ERROR: Failed to check for updates
 * - NO_NETWORK_CONNECTION: No internet connection
 *
 * @example
 *   ```tsx
 *   function App() {
 *     const { updateAppUpdatesState, checkForAppUpdates } = useAppUpdates({ isOnline });
 *
 *     // Manually trigger update check
 *     checkForAppUpdates();
 *   }
 *   ```;
 *
 * @param dependencies - Object containing the current network state
 * @returns Object with update management functions
 */
export function useAppUpdates(dependencies: AppUpdatesDependencies) {
  const { isOnline } = dependencies;

  /**
   * Updates the app update state in the store.
   *
   * @param state - The new app update state
   */
  const updateAppUpdatesState = useCallback((state: AppUpdatesState) => {
    store.setState((prevData) => {
      return {
        ...prevData,
        appUpdatesState: state
      };
    });
  }, []);

  /**
   * Checks for application updates by fetching the remote changelog.
   *
   * Process: 1. Checks if online 2. Fetches remote changelog JSON 3. Compares versions 4. Updates
   * app state. It never opens the release notes prompt; only the title bar indicator reacts.
   */
  const checkForAppUpdates = useCallback(() => {
    if (navigator.onLine) {
      updateAppUpdatesState('CHECKING');

      fetch(releaseNotes.md)
        .then((res) => {
          if (res.status === 200) return res.text();
          throw new Error('response status is not 200');
        })
        .then((resText) => {
          const res = parseChangelog(resText);
          const isThereAnAppUpdate = !isLatestVersion(res.latestVersion.version, version);

          updateAppUpdatesState(isThereAnAppUpdate ? 'OLD' : 'LATEST');

          if (isThereAnAppUpdate) console.log('client has new updates.');
          else console.log('client is up-to-date.');

          return undefined;
        })
        .catch((err) => {
          console.error(err);
          return updateAppUpdatesState('ERROR');
        });
    } else {
      updateAppUpdatesState('NO_NETWORK_CONNECTION');
      console.log(`couldn't check for app updates. Check the network connection.`);
    }
  }, [updateAppUpdatesState]);

  useEffect(
    () => {
      // Check for app updates on app startup after 5 seconds
      const timeoutId = setTimeout(checkForAppUpdates, 5000);

      // Check for app updates every 15 minutes
      const intervalId = setInterval(checkForAppUpdates, 1000 * 60 * 15);

      return () => {
        clearTimeout(timeoutId);
        clearInterval(intervalId);
      };
    },
    // Re-run when online status changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isOnline]
  );

  return {
    updateAppUpdatesState,
    checkForAppUpdates
  };
}
