const mongoose = require('mongoose');
const crypto = require('crypto');

/**
 * Database configuration with security considerations
 * Implements connection pooling, TLS, and encryption settings
 */

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/healthcare_system';

    console.log('🔗 Attempting to connect to MongoDB...');
    console.log(`📍 URI: ${mongoURI.replace(/\/\/.*@/, '//***:***@')}`); // Hide credentials

    const options = {
      // Security settings - for MongoDB Atlas, SSL is required
      ssl: true,
      tlsAllowInvalidCertificates: false,
      authSource: 'admin',

      // Connection settings
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,

      // Retry settings
      retryWrites: true,
      retryReads: true,
    };

    const conn = await mongoose.connect(mongoURI, options);

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Enable encryption for sensitive fields
    mongoose.plugin(schema => {
      if (schema.options.encryption) {
        schema.pre('save', function (next) {
          const encryptedFields = schema.options.encryption.fields || [];
          encryptedFields.forEach(field => {
            if (this[field]) {
              this[field] = encryptField(this[field]);
            }
          });
          next();
        });

        schema.post(['find', 'findOne'], function (docs) {
          const encryptedFields = schema.options.encryption.fields || [];
          const decryptDoc = (doc) => {
            if (!doc) return doc;
            encryptedFields.forEach(field => {
              if (doc[field]) {
                doc[field] = decryptField(doc[field]);
              }
            });
            return doc;
          };

          if (Array.isArray(docs)) {
            return docs.map(decryptDoc);
          }
          return decryptDoc(docs);
        });
      }
    });

    return conn;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.error('🔍 Full error details:', error);
    console.warn('⚠️  MongoDB not available. Some features may not work properly.');

    // Don't exit in development, just continue with warning
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    return null;
  }
};

/**
 * Field-level encryption for sensitive data
 * Note: In production, use proper key management (AWS KMS, Azure Key Vault, etc.)
 */
const encryptField = (text) => {
  if (!text) return text;

  const algorithm = 'aes-256-gcm';
  const secretKey = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  cipher.setAAD(Buffer.from('healthcare-data', 'utf8'));

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
};

const decryptField = (encryptedData) => {
  if (!encryptedData || typeof encryptedData === 'string') return encryptedData;

  const algorithm = 'aes-256-gcm';
  const secretKey = process.env.ENCRYPTION_KEY;

  if (!secretKey) {
    throw new Error('Encryption key not configured');
  }

  const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(encryptedData.iv, 'hex'));
  decipher.setAAD(Buffer.from('healthcare-data', 'utf8'));
  decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));

  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};

module.exports = { connectDB, encryptField, decryptField };
