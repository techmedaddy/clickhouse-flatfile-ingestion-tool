module.exports = {
  // ✅ Infer basic data type from a value
  inferType: (value) => {
    if (value === null || value === undefined || value === '') return 'String';

    // Check for boolean
    const lower = value.toLowerCase?.();
    if (lower === 'true' || lower === 'false') return 'Boolean';

    // Check for integer
    if (/^-?\d+$/.test(value)) return 'Int32';

    // Check for float
    if (/^-?\d+\.\d+$/.test(value)) return 'Float64';

    // Check for ISO date
    if (!isNaN(Date.parse(value))) return 'DateTime';

    return 'String'; // Fallback
  },

  // ✅ Map object of sample row → ClickHouse type schema
  mapRowToSchema: (row) => {
    try {
      const schema = {};
      for (const [key, value] of Object.entries(row)) {
        schema[key] = module.exports.inferType(value);
      }
      return schema;
    } catch (err) {
      console.error('Data mapping error:', err.message);
      throw new Error('🚨 Failed to map CSV row to schema.');
    }
  },

  // ✅ Convert value to ClickHouse-compatible string
  formatValue: (value, type) => {
    try {
      if (value === null || value === undefined || value === '') {
        return `''`; // Treat as empty string
      }

      switch (type) {
        case 'Int32':
        case 'Float64':
          return Number(value);
        case 'Boolean':
          return value.toString().toLowerCase() === 'true' ? 1 : 0;
        case 'DateTime':
          return `'${new Date(value).toISOString().slice(0, 19).replace('T', ' ')}'`; // CH format
        case 'String':
        default:
          return `'${value.toString().replace(/'/g, "\\'")}'`; // Escape single quotes
      }
    } catch (err) {
      console.error(`Format error for value "${value}" of type "${type}":`, err.message);
      return `''`; // Fallback
    }
  }
};
