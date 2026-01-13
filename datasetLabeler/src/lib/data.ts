
export const labels = [
  { id: 'MUMTAZ', name: 'Mumtaz', color: 'bg-green-500' },
  { id: 'JAYYID_JIDDAN', name: 'Jayyid Jiddan', color: 'bg-blue-500' },
  { id: 'JAYYID', name: 'Jayyid', color: 'bg-sky-500' },
  { id: 'MAQBUL', name: 'Maqbul', color: 'bg-yellow-500' },
  { id: 'RASIB', name: 'Rasib', color: 'bg-red-500' },
];

export const getRandomAvatar = (name: string) => {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`;
};
