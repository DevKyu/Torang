import { useState } from 'react';
import { useNavigateBack } from '../../hooks/useNavigateBack';
import { useAdminMonthOptions } from '../../hooks/useAdminMonthOptions';
import { useAllNames } from '../../hooks/useAllNames';
import AdminLayout from './AdminLayout';
import { useMission } from '../../hooks/useMission';
import { useTeamFormation } from '../../hooks/useTeamFormation';
import AdminVillainMissionCard from './AdminVillainMissionCard';
import AdminPredictMissionCard from './AdminPredictMissionCard';
import { SmallText } from '../../styles/global/commonStyle';
import { MonthSelect, Divider } from '../../styles/admin/AdminMissionStyle';

const AdminMission = () => {
  const goBack = useNavigateBack('/admin');
  const { currentYm, monthOptions } = useAdminMonthOptions();
  const [ym, setYm] = useState(currentYm);
  const { villain, predict, predictType, loading } = useMission(ym);
  const { allNames } = useAllNames();
  const { status: teamFormationStatus, groups: teamFormationGroups } = useTeamFormation(
    predictType === 'teamGuess' ? ym : '',
  );

  return (
    <AdminLayout title="활동 미션 관리">
      <MonthSelect value={ym} onChange={(e) => setYm(e.target.value)}>
        {monthOptions.map((option) => (
          <option key={option} value={option}>
            {option.slice(0, 4)}년 {Number(option.slice(4))}월
          </option>
        ))}
      </MonthSelect>

      <AdminVillainMissionCard ym={ym} data={villain} loading={loading} allNames={allNames} />

      <Divider />

      <AdminPredictMissionCard
        ym={ym}
        data={predict}
        predictType={predictType}
        loading={loading}
        allNames={allNames}
        teamFormationStatus={teamFormationStatus}
        teamFormationGroups={teamFormationGroups}
      />

      <SmallText top="middle" onClick={goBack}>
        돌아가기
      </SmallText>
    </AdminLayout>
  );
};

export default AdminMission;
