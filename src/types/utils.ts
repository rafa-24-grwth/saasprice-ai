/**
 * Utility types for handling data serialization/deserialization
 */

/**
 * Converts Date properties to string (ISO 8601) for API serialization
 * This represents what actually gets sent over the wire
 */
export type Serialized<T> = {
    [K in keyof T]: T[K] extends Date 
      ? string 
      : T[K] extends Date | null
      ? string | null
      : T[K] extends (infer U)[]
      ? Serialized<U>[]
      : T[K] extends object | null
      ? Serialized<T[K]> | null
      : T[K];
  };
  
  /**
   * Helper to parse dates from API responses
   */
  export function parseDates<T extends Record<string, any>>(
    obj: T,
    dateFields: (keyof T)[]
  ): T {
    const result = { ...obj };
    
    for (const field of dateFields) {
      const value = result[field];
      if (value && typeof value === 'string') {
        result[field] = new Date(value) as any;
      }
    }
    
    return result;
  }
  
  /**
   * Type guard for checking if a value is not null
   */
  export function isNotNull<T>(value: T | null): value is T {
    return value !== null;
  }
  
  /**
   * Type guard for checking if a value is defined and not null
   */
  export function isDefined<T>(value: T | null | undefined): value is T {
    return value !== null && value !== undefined;
  }
  
  /**
   * Safely parse JSON with a fallback value
   */
  export function safeJsonParse<T>(
    jsonString: string,
    fallback: T
  ): T {
    try {
      return JSON.parse(jsonString);
    } catch {
      return fallback;
    }
  }
  
  /**
   * Format a nullable number as currency
   */
  export function formatNullableCurrency(
    value: number | null,
    currency: string = 'USD',
    fallback: string = 'N/A'
  ): string {
    if (value === null) return fallback;
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  }