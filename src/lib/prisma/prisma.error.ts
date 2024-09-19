export const PrismaClientError = {
  // Common Errors
  GenericError: 'P1000', // Example generic error code
  AuthenticationFailed: 'P1001', // Connection authentication failure
  ConnectionTimeout: 'P1002', // Connection timeout
  DatabaseNotFound: 'P1003', // Database not found

  // Validation Errors
  MissingRequiredValue: 'P2000', // Missing required value
  InvalidValue: 'P2001', // Value does not match expected format
  UniqueConstraintViolation: 'P2002', // Unique constraint failed
  ForeignKeyViolation: 'P2003', // Foreign key constraint failed
  ConstraintFailed: 'P2004', // Constraint failed on the database
  NullConstraintViolation: 'P2005', // Null constraint violation
  ValueOutOfRange: 'P2006', // Value out of range for the column type
  RecordNotFound: 'P2007', // No record found for the provided ID
  FieldValueIsNull: 'P2008', // Field value is null where not allowed

  // Query Engine Errors
  QueryParsingError: 'P2010', // Error parsing the query
  QueryValidationFailed: 'P2011', // Query validation failed
  MutationValidationFailed: 'P2012', // Mutation validation failed
  RelatedRecordNotFound: 'P2013', // Required related record not found

  // Configuration Errors
  InvalidDatasource: 'P3000', // Invalid datasource in Prisma schema
  EnvVarMissing: 'P3001', // Missing environment variable in datasource

  // Migration Errors
  MigrationError: 'P4000', // Migration failed
  MissingMigration: 'P4001', // Migration not found
  InvalidMigration: 'P4002', // Invalid migration format
  MigrationAlreadyApplied: 'P4003', // Migration already applied

  // Deployment Errors
  DeploymentError: 'P5000', // Error during deployment
  MissingSchema: 'P5001', // Missing schema file for the database
  InvalidSchema: 'P5002', // Invalid schema format
  SchemaValidationFailed: 'P5003', // Schema validation failed
} as const;
