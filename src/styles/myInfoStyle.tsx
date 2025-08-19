import { forwardRef } from 'react';
import styled from '@emotion/styled';
import { motion, type HTMLMotionProps } from 'framer-motion';

const COLOR = {
  bgPage: '#f9f9f9',
  bgCard: '#fafafa',
  border: '#e5e7eb',
};

const glass = (alpha = 0.06) => `0 4px 20px rgba(0,0,0,${alpha})`;

export const MyInfoContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 12px;
  background: ${COLOR.bgPage};
`;

export const MyInfoBox = styled.div`
  position: relative;
  width: 90%;
  max-width: 400px;
  padding: 20px 24px 16px;
  border-radius: 16px;
  background: #fff;
  box-shadow: ${glass()};
  text-align: center;
`;

export const InfoSection = styled.div`
  margin: 16px 0;
  border-radius: 12px;
  padding: 16px;
  background: #fff;
  box-shadow: ${glass(0.05)};
`;

export const ScoreContainer = styled.div`
  margin-top: 12px;
`;

export const FilterRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
`;

export const ScoreGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
`;

type MotionBtnProps = HTMLMotionProps<'button'>;
const MotionBtn = forwardRef<HTMLButtonElement, MotionBtnProps>(
  (props, ref) => <motion.button ref={ref} type="button" {...props} />,
);
MotionBtn.displayName = 'MotionBtn';

export const ScoreItem = styled(MotionBtn)<{
  $locked?: boolean;
  $activityGlow?: boolean;
}>`
  position: relative;
  width: 100%;
  min-height: 64px;
  padding-bottom: 6px;
  background: ${COLOR.bgCard};
  border: 1px solid ${COLOR.border};
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition:
    transform 0.15s,
    box-shadow 0.15s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  ${({ $activityGlow, $locked }) =>
    $activityGlow &&
    !$locked &&
    `
      box-shadow:
        0 0 0 2px rgba(245, 158, 11, 0.35),
        0 0 16px 0 rgba(245, 158, 11, 0.15);

      &:hover {
        transform: translateY(-2px);
        box-shadow:
          0 0 0 2px rgba(245, 158, 11, 0.5),
          0 0 20px 2px rgba(245, 158, 11, 0.25);
      }
    `}
`;

export const CardCenter = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  margin-block: 6px;
`;

export const TargetBadge = styled.span<{ locked?: boolean }>`
  position: absolute;
  left: 50%;
  top: 0;
  transform: translate(-50%, -60%);
  font-size: 11px;
  white-space: nowrap;
  padding: 2px 8px;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
  gap: 4px;

  background: ${({ locked }) => (locked ? '#f3f4f6' : '#fef9c3')};
  color: ${({ locked }) => (locked ? '#9ca3af' : '#8a4b0b')};
  cursor: ${({ locked }) => (locked ? 'default' : 'pointer')};
  opacity: ${({ locked }) => (locked ? 0.7 : 1)};

  &:hover {
    background: ${({ locked }) => (locked ? '#f3f4f6' : '#fef3c7')};
  }
`;

export const MonthLabel = styled.div`
  font-size: 12px;
  color: #666;
`;

export const Score = styled.div<{ highlight?: boolean }>`
  font-weight: 700;
  font-size: 16px;
  color: ${(p) => (p.highlight ? '#333' : '#999')};
`;

export const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid ${COLOR.border};

  &:last-of-type {
    border-bottom: none;
  }
`;

export const LabelEmoji = styled.div`
  width: 24px;
  height: 24px;
  min-width: 24px;
  border-radius: 50%;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.1);
  }
`;

export const Label = styled.span`
  font-size: 13px;
  color: #666;
  flex: 1;
  text-align: left;
`;

export const Badge = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #333;
  background: #fff8e1;
  padding: 4px 10px;
  border-radius: 12px;
  flex-shrink: 0;
  transition: background 0.2s;

  &:hover {
    background: #ffefc1;
  }
`;

export const DiffBadge = styled.span<{ color?: string }>`
  font-size: 12px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 9999px;

  ${({ color }) => {
    if (color === '#dc2626') {
      return `color: #991b1b; background: #fee2e2;`;
    }
    if (color === '#2563eb') {
      return `color: #1e40af; background: #dbeafe;`;
    }
    return `color: #444; background: #e5e7eb;`;
  }}
`;

export const InfoDivider = styled.div`
  width: 60%;
  height: 1px;
  margin: 16px auto;
  background: linear-gradient(to right, transparent, #cbd5e1, transparent);
`;

export const TrendChartWrapper = styled.div`
  width: 100%;
  padding: 0 4px;
  margin-top: 8px;
  pointer-events: none;
`;
