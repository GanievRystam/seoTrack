export type PublicUser = {
    id: string;
    email: string;
    name: string;
    createdAt: string;
  };
  
  export type StoredUser = PublicUser & {
    password: string;
  };
  
  export type Session = {
    userId: string;
    createdAt: string;
  };
  