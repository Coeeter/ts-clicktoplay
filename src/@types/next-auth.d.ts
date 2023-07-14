import 'next-auth';

module 'next-auth' {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      image: string
    }
  }
}