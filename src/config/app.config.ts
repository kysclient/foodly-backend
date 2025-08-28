import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 8080,
    globalPrefix: process.env.GLOBAL_PREFIX || 'api/v1',
    corsOrigin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    openaiApiKey: process.env.OPENAI_API_KEY,
    nodeEnv: process.env.NODE_ENV || 'development',
    uploadPath: process.env.UPLOAD_PATH || './uploads',
    maxFileSize: process.env.MAX_FILE_SIZE ? parseInt(process.env.MAX_FILE_SIZE, 10) : 5242880, // 5MB
}));