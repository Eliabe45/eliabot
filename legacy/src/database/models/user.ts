export interface User {
  id: string;
  name: string;
  number: string;
  profilePic: string;
  role?: 'admin' | 'moderator';
}
