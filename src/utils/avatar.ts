export const getAvatarColor = (name: string) => {
  const colors = [
    '#F28B82',
    '#F6C26B',
    '#FFD966',
    '#81C995',
    '#8AB4F8',
    '#AECBFA',
    '#C58AF9',
    '#F78FB3',
    '#F9A8D4',
    '#A0AEC0',
    '#B0BEC5',
    '#90A4AE',
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

export const getInitial = (name: string) => {
  if (!name) return '?';

  return name.trim()[0].toUpperCase();
};
