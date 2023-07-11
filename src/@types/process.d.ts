module NodeJS {
    interface ProcessEnv {
        NODE_ENV: 'development' | 'production';
        AWS_ACCESS_KEY: string;
        AWS_SECRET_ACCESS_KEY: string;
        AWS_S3_BUCKET_NAME: string;
        DATABASE_URL: string;
        GOOGLE_CLIENT_ID: string;
        GOOGLE_CLIENT_SECRET: string;
        NEXTAUTH_URL: string;
        NEXTAUTH_SECRET: string;
        EMAIL_SERVER_HOST: string;
        EMAIL_SERVER_PORT: number;
        EMAIL_SERVER_USER: string;
        EMAIL_SERVER_PASSWORD: string;
        EMAIL_FROM: string;
    }
}