import { useEffect, useRef, useState } from 'react';
import type { VillainMissionData } from '../../hooks/useMission';
import HiddenMissionModal from './HiddenMissionModal';
import { HiddenMissionBtn } from '../../styles/mission/MissionStyle';

type Props = {
  data: VillainMissionData;
  myEmpId: string;
};

const HiddenMissionTrigger = ({ data, myEmpId }: Props) => {
  const [modalOpen, setModalOpen] = useState(false);
  const hasAutoOpenedRef = useRef(false);

  const isVillain = !!myEmpId && data.roles?.villain === myEmpId;
  const isHelper = !!myEmpId && data.roles?.helper === myEmpId;
  const myRole: 'villain' | 'helper' | null = isVillain ? 'villain' : isHelper ? 'helper' : null;

  useEffect(() => {
    if (!myRole || hasAutoOpenedRef.current) return;
    const t = setTimeout(() => {
      hasAutoOpenedRef.current = true;
      setModalOpen(true);
    }, 800);
    return () => clearTimeout(t);
  }, [myRole]);

  if (!myRole || !data.hidden?.[myRole]) return null;

  return (
    <>
      <HiddenMissionBtn role={myRole} onClick={() => setModalOpen(true)}>
        {myRole === 'villain' ? '🎭 나의 히든 미션 보기' : '🤝 나의 히든 미션 보기'}
      </HiddenMissionBtn>
      <HiddenMissionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        role={myRole}
        hidden={data.hidden[myRole]!}
      />
    </>
  );
};

export default HiddenMissionTrigger;
