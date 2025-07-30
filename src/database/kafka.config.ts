export const kafkaConfig = {
  clientId: process.env.KAFKA_CLIENT_ID || 'chat-server',
  brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
  retry: {
    initialRetryTime: 100,
    retries: 8,
  },
};
