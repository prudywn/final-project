export const formatValidationErrors = (errors) => {
  if (!errors || !errors.issues) return 'Validation failed';

  if (Array.isArray(errors.issues)) return errors.issues.map((error) => error.message).join(', ');

  return JSON.stringify(errors);
};