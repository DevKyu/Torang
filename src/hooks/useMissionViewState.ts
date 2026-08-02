import { useMemo } from 'react';
import { useUiStore } from '../stores/useUiStore';
import {
  getDaysUntilMissionReveal,
  getMissionViewState,
  type MissionViewState,
} from '../utils/missionViewState';
import type { MissionData } from './useMission';

export type MissionViewStateResult = {
  daysUntilReveal: number | null;
  viewState: MissionViewState;
};

export const useMissionViewState = (
  activityYmd: string | number | null | undefined,
  missionData: MissionData | null,
): MissionViewStateResult => {
  const lastSync = useUiStore((s) => s.lastSync);

  const daysUntilReveal = useMemo(
    () =>
      getDaysUntilMissionReveal(
        activityYmd,
        missionData?.config,
        useUiStore.getState().getServerNow(),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activityYmd, missionData, lastSync],
  );

  const viewState = useMemo(
    () => getMissionViewState(missionData?.config, daysUntilReveal),
    [missionData, daysUntilReveal],
  );

  return { daysUntilReveal, viewState };
};
