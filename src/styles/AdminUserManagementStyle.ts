import styled from '@emotion/styled';
import * as Accordion from '@radix-ui/react-accordion';

export const SearchRow = styled.div`
  display: flex;
  gap: 10px;

  margin-bottom: 14px;

  @media (max-width: 640px) {
    gap: 8px;
  }

  input {
    flex: 1;

    min-width: 0;

    height: 44px;

    padding: 0 14px;

    border: 1px solid #e5e7eb;
    border-radius: 14px;

    background: rgba(255, 255, 255, 0.94);

    font-size: 0.9rem;
    color: #1f2937;

    outline: none;

    transition:
      border-color 0.16s ease,
      background 0.16s ease,
      box-shadow 0.16s ease;

    &::placeholder {
      color: #9ca3af;
    }

    &:focus {
      border-color: #c7a27c;
      background: #fff;

      box-shadow: 0 0 0 4px rgba(199, 162, 124, 0.1);
    }
  }

  button {
    flex-shrink: 0;

    height: 44px;

    padding: 0 16px;

    border: none;
    border-radius: 14px;

    background: linear-gradient(135deg, #3b82f6, #2563eb);

    color: white;

    font-size: 0.84rem;
    font-weight: 700;

    cursor: pointer;

    transition:
      transform 0.12s ease,
      opacity 0.16s ease;

    &:disabled {
      opacity: 0.5;
      cursor: default;
    }

    &:active:not(:disabled) {
      transform: scale(0.98);
    }
  }
`;
export const AdminLinkSection = styled.div`
  display: flex;
  flex-direction: column;

  gap: 8px;

  margin: 0 0 16px;
`;

export const AdminMainLink = styled.button`
  width: 100%;

  min-height: 50px;

  padding: 12px 16px;

  border: none;
  border-radius: 18px;

  background: linear-gradient(135deg, #111827, #0f172a);

  color: white;

  font-size: 0.9rem;
  font-weight: 800;

  cursor: pointer;

  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);

  transition:
    transform 0.12s ease,
    opacity 0.16s ease;

  &:active {
    transform: scale(0.985);
  }

  @media (max-width: 640px) {
    min-height: 48px;

    font-size: 0.86rem;
  }
`;

export const AdminSubLinkRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));

  gap: 8px;
`;

export const AdminSubLink = styled.button`
  min-height: 44px;

  padding: 10px 12px;

  border: 1px solid #e5e7eb;
  border-radius: 14px;

  background: rgba(255, 255, 255, 0.95);

  color: #374151;

  font-size: 0.8rem;
  font-weight: 700;

  line-height: 1.35;

  cursor: pointer;

  transition:
    border-color 0.16s ease,
    background 0.16s ease,
    transform 0.12s ease;

  &:hover {
    border-color: #d6b38c;
    background: #fffaf5;
  }

  &:active {
    transform: scale(0.985);
  }

  @media (max-width: 640px) {
    min-height: 42px;

    padding: 9px 10px;

    font-size: 0.76rem;
  }
`;

export const ResultList = styled.ul`
  list-style: none;

  margin: 0 0 16px;
  padding: 8px;

  border: 1px solid #ececec;
  border-radius: 20px;

  background: rgba(255, 255, 255, 0.96);

  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.04);

  overflow: hidden;
`;

export const ResultItem = styled.li`
  display: grid;
  grid-template-columns: 78px 1fr auto;
  align-items: center;

  gap: 10px;

  min-height: 54px;

  padding: 10px 14px;

  border-radius: 14px;

  cursor: pointer;

  transition:
    background 0.16s ease,
    transform 0.1s ease;

  &:hover {
    background: #f8fafc;
  }

  &:active {
    transform: scale(0.992);
  }

  &:not(:last-of-type) {
    margin-bottom: 6px;
  }

  .emp {
    font-size: 0.78rem;
    font-weight: 700;
    color: #111827;
  }

  .name {
    overflow: hidden;

    font-size: 0.86rem;
    font-weight: 500;

    color: #374151;

    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .pin {
    display: flex;
    align-items: center;
    justify-content: center;

    min-width: 58px;
    height: 28px;

    padding: 0 10px;

    border-radius: 999px;

    background: linear-gradient(135deg, #60a5fa, #2563eb);

    color: white;

    font-size: 0.72rem;
    font-weight: 700;

    flex-shrink: 0;
  }

  @media (max-width: 640px) {
    grid-template-columns: 72px 1fr auto;
    gap: 8px;

    padding: 10px 12px;

    .emp {
      font-size: 0.74rem;
    }

    .name {
      font-size: 0.82rem;
    }

    .pin {
      min-width: 54px;
      height: 26px;

      font-size: 0.7rem;
    }
  }
`;

export const UserCard = styled.div`
  padding: 18px;

  border: 1px solid #ececec;
  border-radius: 24px;

  background: rgba(255, 255, 255, 0.97);

  box-shadow: 0 14px 36px rgba(15, 23, 42, 0.05);

  margin-bottom: 18px;

  h3 {
    margin: 0;

    font-size: 1rem;
    font-weight: 800;

    color: #111827;
  }

  p {
    margin: 5px 0;

    font-size: 0.82rem;
    line-height: 1.45;

    color: #4b5563;
  }

  @media (max-width: 640px) {
    padding: 16px;
    border-radius: 20px;
  }
`;

export const UserCardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  gap: 12px;

  margin-bottom: 14px;

  h3 {
    flex: 1;
    min-width: 0;
  }
`;

export const DeleteButton = styled.button`
  flex-shrink: 0;

  height: 32px;

  padding: 0 12px;

  border: none;
  border-radius: 10px;

  background: rgba(239, 68, 68, 0.12);

  color: #dc2626;

  font-size: 0.74rem;
  font-weight: 700;

  cursor: pointer;

  transition:
    background 0.16s ease,
    transform 0.12s ease;

  &:hover {
    background: rgba(239, 68, 68, 0.18);
  }

  &:active {
    transform: scale(0.97);
  }
`;

export const ButtonRow = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));

  gap: 8px;

  margin-top: 14px;

  button {
    height: 38px;

    border: none;
    border-radius: 12px;

    font-size: 0.78rem;
    font-weight: 700;

    color: white;

    cursor: pointer;

    transition:
      transform 0.12s ease,
      opacity 0.16s ease;
  }

  button:nth-of-type(1),
  button:nth-of-type(3) {
    background: linear-gradient(135deg, #10b981, #059669);
  }

  button:nth-of-type(2),
  button:nth-of-type(4) {
    background: linear-gradient(135deg, #ef4444, #dc2626);
  }

  button:nth-of-type(5) {
    background: linear-gradient(135deg, #374151, #111827);
  }

  button:active {
    transform: scale(0.98);
  }

  @media (max-width: 640px) {
    grid-template-columns: repeat(2, 1fr);

    button:nth-of-type(5) {
      grid-column: span 2;
    }
  }
`;

export const Divider = styled.hr`
  margin: 22px 0;

  border: none;

  height: 1px;

  background: linear-gradient(to right, transparent, #e5e7eb, transparent);
`;

export const BulkSection = styled.div`
  display: flex;
  flex-direction: column;

  gap: 10px;

  button {
    width: 100%;

    min-height: 42px;

    padding: 10px 14px;

    border: none;
    border-radius: 14px;

    background: linear-gradient(135deg, #1f2937, #111827);

    color: white;

    font-size: 0.82rem;
    font-weight: 700;

    cursor: pointer;

    transition:
      transform 0.12s ease,
      opacity 0.18s ease;

    &:disabled {
      opacity: 0.5;
      cursor: default;
    }

    &:active:not(:disabled) {
      transform: scale(0.985);
    }
  }
`;

export const ScoreGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));

  gap: 10px;

  width: 100%;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

export const ScoreCell = styled.div`
  display: flex;
  flex-direction: column;

  gap: 10px;

  min-height: 152px;

  padding: 14px 12px;

  border: 1px solid #ececec;
  border-radius: 18px;

  background: linear-gradient(to bottom, #ffffff, #fcfcfd);

  transition:
    border-color 0.18s ease,
    transform 0.12s ease;

  &:hover {
    border-color: #d8c1a6;
  }

  h5 {
    margin: 0;

    font-size: 0.78rem;
    font-weight: 800;

    color: #374151;
  }

  p {
    margin: 0;

    font-size: 0.96rem;
    font-weight: 800;

    color: #111827;
  }

  .input-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;

    min-height: 36px;
  }

  input {
    width: 100%;

    height: 34px;

    padding: 0 10px;

    border: 1px solid #e5e7eb;
    border-radius: 10px;

    background: white;

    text-align: center;

    font-size: 0.84rem;

    outline: none;

    &:focus {
      border-color: #c7a27c;
    }
  }
`;

export const ActionRow = styled.div`
  display: flex;

  gap: 6px;

  margin-top: auto;

  button {
    flex: 1;

    height: 32px;

    border: none;
    border-radius: 10px;

    font-size: 0.72rem;
    font-weight: 700;

    color: white;

    cursor: pointer;

    transition:
      transform 0.1s ease,
      opacity 0.16s ease;
  }

  button.edit {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
  }

  button.save {
    background: linear-gradient(135deg, #10b981, #059669);
  }

  button.delete {
    background: linear-gradient(135deg, #ef4444, #dc2626);
  }

  button:active {
    transform: scale(0.98);
  }
`;

export const AccordionRoot = styled(Accordion.Root)`
  display: flex;
  flex-direction: column;

  gap: 10px;
`;

export const AccordionItem = styled(Accordion.Item)`
  overflow: hidden;

  border: 1px solid #ececec;
  border-radius: 18px;

  background: #fff;
`;

export const AccordionHeader = styled(Accordion.Header)``;

export const AccordionTrigger = styled(Accordion.Trigger)`
  all: unset;

  display: flex;
  align-items: center;
  justify-content: space-between;

  width: 100%;

  min-height: 50px;

  padding: 0 16px;

  background: #fff;

  font-size: 0.88rem;
  font-weight: 700;

  color: #1f2937;

  cursor: pointer;

  transition:
    background 0.18s ease,
    color 0.18s ease;

  &[data-state='open'] {
    background: linear-gradient(135deg, #1f2937, #111827);
    color: white;
  }
`;

export const AccordionContent = styled(Accordion.Content)`
  overflow: hidden;

  padding: 14px;

  animation: slideDown 240ms ease-out;

  &[data-state='closed'] {
    animation: slideUp 180ms ease-in;
  }

  @keyframes slideDown {
    from {
      height: 0;
      opacity: 0;
    }

    to {
      height: var(--radix-accordion-content-height);
      opacity: 1;
    }
  }

  @keyframes slideUp {
    from {
      height: var(--radix-accordion-content-height);
      opacity: 1;
    }

    to {
      height: 0;
      opacity: 0;
    }
  }
`;

export const InnerAccordion = styled(Accordion.Root)`
  display: flex;
  flex-direction: column;

  gap: 8px;
`;

export const InnerItem = styled(Accordion.Item)`
  overflow: hidden;

  border: 1px solid #efefef;
  border-radius: 14px;

  background: #fafafa;
`;

export const InnerTrigger = styled(Accordion.Trigger)`
  all: unset;

  display: flex;
  align-items: center;
  justify-content: space-between;

  width: 100%;

  min-height: 42px;

  padding: 0 14px;

  background: transparent;

  font-size: 0.82rem;
  font-weight: 700;

  color: #374151;

  cursor: pointer;

  &[data-state='open'] {
    background: #f3f4f6;
    color: #111827;
  }
`;

export const InnerContent = styled(Accordion.Content)`
  padding: 12px;
`;

export const NewUserForm = styled.div`
  display: grid;

  gap: 10px;

  input,
  select {
    width: 100%;

    height: 40px;

    padding: 0 12px;

    border: 1px solid #e5e7eb;
    border-radius: 12px;

    background: white;

    font-size: 0.84rem;

    outline: none;

    &:focus {
      border-color: #c7a27c;
    }
  }

  button {
    height: 44px;

    border: none;
    border-radius: 14px;

    background: linear-gradient(135deg, #10b981, #059669);

    color: white;

    font-size: 0.86rem;
    font-weight: 700;

    cursor: pointer;

    transition: transform 0.12s ease;

    &:active {
      transform: scale(0.985);
    }
  }
`;
