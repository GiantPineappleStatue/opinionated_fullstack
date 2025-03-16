export default () => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    port: parseInt(process.env.PORT || '3002', 10),
    database: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_DATABASE || 'fullstack_db',
      maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '10', 10),
      connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '10000', 10),
    },
    jwt: {
      secret: process.env.JWT_SECRET || (isProduction ? undefined : 'super-secret-key-change-in-production'),
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    },
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
      maxReconnectAttempts: parseInt(process.env.REDIS_MAX_RECONNECT_ATTEMPTS || '5', 10),
      reconnectTimeWait: parseInt(process.env.REDIS_RECONNECT_TIME_WAIT || '5000', 10),
    },
    rabbitmq: {
      url: process.env.RABBITMQ_URL || `amqp://${process.env.RABBITMQ_USER || 'user'}:${process.env.RABBITMQ_PASSWORD || 'password'}@${process.env.RABBITMQ_HOST || 'localhost'}:${process.env.RABBITMQ_PORT || '5672'}`,
      queue: process.env.RABBITMQ_QUEUE || 'tasks',
      maxReconnectAttempts: parseInt(process.env.RABBITMQ_MAX_RECONNECT_ATTEMPTS || '5', 10),
      reconnectTimeWait: parseInt(process.env.RABBITMQ_RECONNECT_TIME_WAIT || '5000', 10),
    },
    nats: {
      url: process.env.NATS_URL || 'nats://localhost:4222',
      maxReconnectAttempts: parseInt(process.env.NATS_MAX_RECONNECT_ATTEMPTS || '5', 10),
      reconnectTimeWait: parseInt(process.env.NATS_RECONNECT_TIME_WAIT || '5000', 10),
      username: process.env.NATS_USERNAME || 'nats',
      password: process.env.NATS_PASSWORD || 'password',
    },
    cors: {
      origin: process.env.FRONTEND_URL || (isProduction ? undefined : 'http://localhost:5173'),
      credentials: true,
    },
    throttle: {
      ttl: parseInt(process.env.THROTTLE_TTL || '60', 10),
      limit: parseInt(process.env.THROTTLE_LIMIT || '10', 10),
    },
    session: {
      secret: process.env.SESSION_SECRET || (isProduction ? undefined : 'super-secret-session-key-change-in-production'),
      ttl: parseInt(process.env.SESSION_TTL || '86400', 10), // 1 day in seconds
      cookie: {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: parseInt(process.env.SESSION_COOKIE_MAX_AGE || '86400000', 10), // 1 day in milliseconds
      },
    },
    cache: {
      ttl: parseInt(process.env.CACHE_TTL || '300', 10), // 5 minutes in seconds
      max: parseInt(process.env.CACHE_MAX_ITEMS || '1000', 10),
    },
  };
}; 