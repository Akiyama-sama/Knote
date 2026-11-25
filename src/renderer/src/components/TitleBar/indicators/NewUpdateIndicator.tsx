import { store } from '@renderer/store/store';
import { useStore } from '@tanstack/react-store';
import { lazy, useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { AppUpdateContext } from '../../../contexts/AppUpdateContext';
import Button from '../../Button';

const ReleaseNotesPrompt = lazy(() => import('../../ReleaseNotesPrompt/ReleaseNotesPrompt'));

const NewUpdateIndicator = () => {
  const appUpdatesState = useStore(store, (state) => state.appUpdatesState);

  const { changePromptMenuData } = useContext(AppUpdateContext);
  const { t } = useTranslation();

  // Update checks are silent: the indicator only appears when there actually is
  // a newer version, never while checking or when the app is already up to date.
  if (appUpdatesState !== 'OLD') return null;

  return (
    <Button
      className="new-update-indicator bg-background-color-2 hover:text-font-color-highlight dark:bg-dark-background-color-2 dark:hover:text-dark-font-color-highlight !mr-1 flex cursor-pointer items-center justify-center rounded-md !border-0 !px-3 !py-1 text-center outline-offset-1 transition-[background] focus-visible:!outline"
      iconClassName="material-icons-round-outlined"
      iconName="download"
      tooltipLabel={t('common.newUpdateAvailable')}
      clickHandler={() => changePromptMenuData(true, <ReleaseNotesPrompt />)}
    />
  );
};

export default NewUpdateIndicator;
