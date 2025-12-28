
export const labels = [
  { id: 'mumtaz', name: 'Mumtaz', color: 'bg-green-500' },
  { id: 'jayyid_jiddan', name: 'Jayyid Jiddan', color: 'bg-blue-500' },
  { id: 'jayyid', name: 'Jayyid', color: 'bg-sky-500' },
  { id: 'maqbul', name: 'Maqbul', color: 'bg-yellow-500' },
  { id: 'rasib', name: 'Rasib', color: 'bg-red-500' },
];

export const audioFiles = [
  { id: 'file1', name: 'rec_001.wav', url: 'https://wavesurfer-js.org/example/media/demo.wav' },
  { id: 'file2', name: 'rec_002.wav', url: 'https://wavesurfer-js.org/example/media/stereo.mp3' },
  { id: 'file3', name: 'rec_003.wav', url: 'https://wavesurfer-js.org/example/media/demo.wav' },
  { id: 'file4', name: 'rec_004.wav', url: 'https://wavesurfer-js.org/example/media/stereo.mp3' },
  { id: 'file5', name: 'rec_005.wav', url: 'https://wavesurfer-js.org/example/media/demo.wav' },
];


export const adminStats = {
  totalLabeled: 1250,
  filesRemaining: 3750,
  labelCounts: [
    { label: 'Mumtaz', count: 300 },
    { label: 'Jayyid Jiddan', count: 450 },
    { label: 'Jayyid', count: 250 },
    { label: 'Maqbul', count: 150 },
    { label: 'Rasib', count: 100 },
  ],
};

export const labelDistributionData = [
  { name: 'Mumtaz', value: 300 },
  { name: 'Jayyid Jiddan', value: 450 },
  { name: 'Jayyid', value: 250 },
  { name: 'Maqbul', value: 150 },
  { name: 'Rasib', value: 100 },
];

export const activityData = [
  { date: '2023-05-01', Zaid: 20, Ali: 15 },
  { date: '2023-05-02', Zaid: 25, Ali: 22 },
  { date: '2023-05-03', Zaid: 30, Ali: 18 },
  { date: '2023-05-04', Zaid: 28, Ali: 25 },
  { date: '2023-05-05', Zaid: 35, Ali: 30 },
  { date: '2023-05-06', Zaid: 22, Ali: 28 },
  { date: '2023-05-07', Zaid: 40, Ali: 33 },
];

export const chartConfig = {
  Zaid: { label: 'Zaid', color: 'hsl(var(--chart-1))' },
  Ali: { label: 'Ali', color: 'hsl(var(--chart-2))' },
  value: { label: 'Count', color: 'hsl(var(--primary))'},
};

export const users = [
    { id: 'user1', name: 'Zaid', email: 'zaid@example.com', password: 'password123', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
    { id: 'user2', name: 'Ali', email: 'ali@example.com', password: 'password456', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704e' },
];

export const labelingHistory = [
    { id: 'hist1', fileName: 'rec_001.wav', label: 'Mumtaz', user: 'Zaid', timestamp: '2023-05-07 10:30 AM' },
    { id: 'hist2', fileName: 'rec_002.wav', label: 'Jayyid', user: 'Ali', timestamp: '2023-05-07 10:32 AM' },
    { id: 'hist3', fileName: 'rec_003.wav', label: 'Rasib', user: 'Zaid', timestamp: '2023-05-07 10:35 AM' },
    { id: 'hist4', fileName: 'rec_004.wav', label: 'Jayyid Jiddan', user: 'Ali', timestamp: '2023-05-07 10:38 AM' },
];
