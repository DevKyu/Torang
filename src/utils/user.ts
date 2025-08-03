export const getTypeLabel = (type: string) => {
  switch (type) {
    case 'Member':
      return '정회원';
    case 'Associate':
      return '준회원';
    default:
      return '회원';
  }
};
