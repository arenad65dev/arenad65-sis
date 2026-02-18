// Gera avatar com iniciais a partir do nome
export const generateInitialsAvatar = (name: string): string => {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
  
  // Gera uma cor baseada no nome
  const colors = [
    { bg: '#E3F2FD', text: '#1565C0' },
    { bg: '#F3E5F5', text: '#6A1B9A' },
    { bg: '#E8F5E9', text: '#2E7D32' },
    { bg: '#FFF3E0', text: '#E65100' },
    { bg: '#FCE4EC', text: '#C2185B' },
    { bg: '#E0F2F1', text: '#00695C' },
    { bg: '#FFF8E1', text: '#F57F17' },
    { bg: '#E8EAF6', text: '#283593' },
  ];
  
  const colorIndex = name.charCodeAt(0) % colors.length;
  const color = colors[colorIndex];
  
  // Retorna URL com UI Avatar
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${color.bg.replace('#', '')}&color=${color.text.replace('#', '')}&size=128&font-size=0.5&bold=true`;
};

// Retorna avatar do usuário ou gera um com iniciais
export const getUserAvatar = (user: { name: string; avatar?: string | null }): string => {
  if (user.avatar && user.avatar.trim() !== '') {
    return user.avatar;
  }
  return generateInitialsAvatar(user.name);
};
