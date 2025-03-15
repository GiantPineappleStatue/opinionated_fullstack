export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    enabled: process.env.DB_ENABLED !== 'false',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'fullstack_db',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'super-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
  redis: {
    enabled: process.env.REDIS_ENABLED !== 'false',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  rabbitmq: {
    enabled: process.env.RABBITMQ_ENABLED === 'true' ? 'true' : 'false',
    url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
    queue: process.env.RABBITMQ_QUEUE || 'tasks',
  },
  nats: {
    enabled: process.env.NATS_ENABLED !== 'false',
    url: process.env.NATS_URL || 'nats://localhost:4222',
  },
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL || '60', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT || '10', 10),
  },
}); 