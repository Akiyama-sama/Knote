import { app } from 'electron';
import electronUpdater from 'electron-updater';

import logger from './logger';

const { autoUpdater } = electronUpdater;

// Update checks are silent: no startup dialog, not even when the app is already
// up to date. When a new version exists the renderer shows the update indicator
// in the title bar. On Windows/Linux the update is downloaded in the background
// and installed the next time the app quits.
//
// macOS is excluded: Squirrel.Mac only installs updates signed with a Developer
// ID, and this build is unsigned, so an automatic download would only waste
// bandwidth and then fail at install time. Mac users get the indicator and the
// release notes prompt instead, and update manually.
const CAN_AUTO_UPDATE = process.platform !== 'darwin';

autoUpdater.autoDownload = CAN_AUTO_UPDATE;
autoUpdater.autoInstallOnAppQuit = CAN_AUTO_UPDATE;

autoUpdater.on('error', (error) => {
  logger.error(
    'Failed to check for or download an app update.',
    {},
    error == null ? 'unknown' : error
  );
});

autoUpdater.on('update-available', (info) => {
  logger.info(
    CAN_AUTO_UPDATE
      ? 'App update available. Downloading it in the background.'
      : 'App update available. Automatic install is unsupported on this platform.',
    { version: info?.version, willAutoDownload: CAN_AUTO_UPDATE }
  );
});

autoUpdater.on('update-not-available', () => {
  logger.debug('App is up to date.');
});

autoUpdater.on('update-downloaded', (info) => {
  logger.info('App update downloaded. It will be installed when the app quits.', {
    version: info?.version
  });
});

// export this to MenuItem click callback
export default function checkForUpdates() {
  if (!app.isPackaged) {
    logger.debug('Skipping app update check outside a packaged build.');
    return;
  }

  autoUpdater.checkForUpdates().catch((error) => {
    logger.error('Failed to check for app updates.', {}, error);
  });
}
