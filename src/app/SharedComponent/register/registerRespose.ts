export interface SignUp {
  message:string;
  name:string;
  email:string;
  roles:string[];
  token:string;
  expiredOn:Date;
  isAuthenticated:boolean;
}
