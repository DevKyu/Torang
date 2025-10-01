import styled from '@emotion/styled';
import * as Accordion from '@radix-ui/react-accordion';

export const SearchRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  input {
    flex: 1;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 8px;
  }
  button {
    padding: 8px 12px;
    background: #3b82f6;
    color: #fff;
    border: none;
    border-radius: 8px;
    cursor: pointer;
  }
`;

export const ResultList = styled.ul`
  list-style: none;
  margin: 0 0 16px;
  padding: 0;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
`;

export const ResultItem = styled.li`
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  align-items: center;
  padding: 10px 14px;
  font-size: 14px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  transition: background 0.2s;

  &:last-of-type {
    border-bottom: none;
  }
  &:hover {
    background: #f9fafb;
  }

  .emp {
    font-weight: 600;
    color: #111827;
  }
  .name {
    color: #374151;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .pin {
    background: #3b82f6;
    color: #fff;
    font-size: 12px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 9999px;
    text-align: center;
    min-width: 44px;
  }
`;

export const UserCard = styled.div`
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 12px;
  background: #fff;
  margin-bottom: 20px;

  h3 {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #111827;
  }
  p {
    font-size: 13px;
    margin: 4px 0;
    color: #374151;
  }
`;

export const UserCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  h3 {
    font-size: 15px;
    font-weight: bold;
  }
`;

export const DeleteButton = styled.button`
  padding: 6px 10px;
  font-size: 12px;
  background: #ef4444;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  &:hover {
    background: #dc2626;
  }
`;

export const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
  button {
    flex: 1;
    min-width: 70px;
    padding: 8px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    background: #10b981;
    color: #fff;
  }
  button:nth-of-type(2n) {
    background: #ef4444;
  }
`;

export const Divider = styled.hr`
  margin: 24px 0;
  border: none;
  height: 1px;
  background: #e5e7eb;
`;

export const BulkSection = styled.div`
  margin-top: 12px;
  button {
    width: 100%;
    padding: 8px 12px;
    border-radius: 8px;
    border: none;
    background: #3b82f6;
    color: #fff;
    cursor: pointer;
  }
`;

export const ScoreGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 6px;
  width: 100%;

  @media (min-width: 600px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

export const ScoreCell = styled.div`
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 8px;
  font-size: 13px;
  text-align: center;
  background: #fff;

  h5 {
    margin: 0 0 4px;
    font-size: 12px;
    font-weight: bold;
  }
  p {
    margin: 0;
    font-size: 14px;
    font-weight: 500;
  }

  .input-wrapper {
    height: 32px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  input {
    width: 70%;
    padding: 4px;
    font-size: 13px;
    border: 1px solid #ddd;
    border-radius: 6px;
  }
`;
export const ActionRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: auto;
  min-height: 32px;

  button {
    flex: 1;
    min-width: 60px;
    font-size: 12px;
    padding: 6px 10px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    background: #3b82f6;
    color: #fff;
    font-weight: 500;
  }

  button.delete {
    background: #ef4444;
  }
  button.save {
    background: #10b981;
  }
`;

export const AccordionRoot = styled(Accordion.Root)`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const AccordionItem = styled(Accordion.Item)`
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  overflow: hidden;
`;

export const AccordionHeader = styled(Accordion.Header)``;

export const AccordionTrigger = styled(Accordion.Trigger)`
  all: unset;
  width: 100%;
  padding: 10px 14px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background 0.25s ease;
  &[data-state='open'] {
    background: #3b82f6;
    color: white;
  }
`;

export const AccordionContent = styled(Accordion.Content)`
  width: 100%;
  overflow: hidden;
  padding: 12px;
  font-size: 13px;
  animation: slideDown 300ms ease-out;
  &[data-state='closed'] {
    animation: slideUp 200ms ease-in;
  }
  @keyframes slideDown {
    from {
      height: 0;
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      height: var(--radix-accordion-content-height);
      opacity: 1;
      transform: translateY(0);
    }
  }
  @keyframes slideUp {
    from {
      height: var(--radix-accordion-content-height);
      opacity: 1;
      transform: translateY(0);
    }
    to {
      height: 0;
      opacity: 0;
      transform: translateY(-4px);
    }
  }
`;

export const InnerAccordion = styled(Accordion.Root)`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const InnerItem = styled(Accordion.Item)`
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  overflow: hidden;
`;

export const InnerTrigger = styled(Accordion.Trigger)`
  all: unset;
  width: 100%;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f9fafb;
  cursor: pointer;
  transition: background 0.25s;
  &[data-state='open'] {
    background: #e0f2fe;
    color: #0369a1;
  }
`;

export const InnerContent = styled(Accordion.Content)`
  padding: 10px 8px;
  animation: slideDown 250ms ease-out;
  &[data-state='closed'] {
    animation: slideUp 180ms ease-in;
  }
`;

export const NewUserForm = styled.div`
  display: grid;
  gap: 8px;
  margin-top: 8px;
  input,
  select {
    padding: 6px 8px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 13px;
  }
  button {
    padding: 8px;
    background: #10b981;
    color: #fff;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }
`;
