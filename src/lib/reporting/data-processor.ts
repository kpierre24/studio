import { FilterConfig } from '@/types/reporting';

export class DataProcessor {
  private static instance: DataProcessor;

  public static getInstance(): DataProcessor {
    if (!DataProcessor.instance) {
      DataProcessor.instance = new DataProcessor();
    }
    return DataProcessor.instance;
  }

  // Data Filtering
  applyFilters(data: any[], filters: FilterConfig[]): any[] {
    return data.filter(item => {
      return filters.every(filter => this.evaluateFilter(item, filter));
    });
  }

  private evaluateFilter(item: any, filter: FilterConfig): boolean {
    const fieldValue = this.getNestedValue(item, filter.field);
    
    switch (filter.operator) {
      case 'equals':
        return fieldValue === filter.value;
      
      case 'contains':
        return String(fieldValue).toLowerCase().includes(String(filter.value).toLowerCase());
      
      case 'greaterThan':
        return Number(fieldValue) > Number(filter.value);
      
      case 'lessThan':
        return Number(fieldValue) < Number(filter.value);
      
      case 'between':
        if (Array.isArray(filter.value) && filter.value.length === 2) {
          const numValue = Number(fieldValue);
          return numValue >= Number(filter.value[0]) && numValue <= Number(filter.value[1]);
        }
        return false;
      
      case 'in':
        return Array.isArray(filter.value) && filter.value.includes(fieldValue);
      
      default:
        return true;
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  // Data Aggregation
  aggregateData(
    data: any[],
    groupBy: string,
    aggregations: Array<{
      field: string;
      operation: 'sum' | 'avg' | 'count' | 'min' | 'max';
      alias?: string;
    }>
  ): any[] {
    const grouped = this.groupBy(data, groupBy);
    
    return Object.entries(grouped).map(([key, items]) => {
      const result: any = { [groupBy]: key };
      
      aggregations.forEach(agg => {
        const alias = agg.alias || `${agg.operation}_${agg.field}`;
        result[alias] = this.performAggregation(items, agg.field, agg.operation);
      });
      
      return result;
    });
  }

  private groupBy(data: any[], field: string): Record<string, any[]> {
    return data.reduce((groups, item) => {
      const key = this.getNestedValue(item, field) || 'undefined';
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    }, {});
  }

  private performAggregation(
    items: any[],
    field: string,
    operation: 'sum' | 'avg' | 'count' | 'min' | 'max'
  ): number {
    switch (operation) {
      case 'count':
        return items.length;
      
      case 'sum':
        return items.reduce((sum, item) => sum + (Number(this.getNestedValue(item, field)) || 0), 0);
      
      case 'avg':
        const values = items.map(item => Number(this.getNestedValue(item, field)) || 0);
        return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
      
      case 'min':
        const minValues = items.map(item => Number(this.getNestedValue(item, field)) || 0);
        return minValues.length > 0 ? Math.min(...minValues) : 0;
      
      case 'max':
        const maxValues = items.map(item => Number(this.getNestedValue(item, field)) || 0);
        return maxValues.length > 0 ? Math.max(...maxValues) : 0;
      
      default:
        return 0;
    }
  }

  // Data Sorting
  sortData(
    data: any[],
    sortBy: Array<{
      field: string;
      direction: 'asc' | 'desc';
    }>
  ): any[] {
    return [...data].sort((a, b) => {
      for (const sort of sortBy) {
        const aValue = this.getNestedValue(a, sort.field);
        const bValue = this.getNestedValue(b, sort.field);
        
        let comparison = 0;
        
        if (aValue < bValue) comparison = -1;
        else if (aValue > bValue) comparison = 1;
        
        if (comparison !== 0) {
          return sort.direction === 'asc' ? comparison : -comparison;
        }
      }
      return 0;
    });
  }

  // Data Pagination
  paginateData(
    data: any[],
    page: number,
    pageSize: number
  ): {
    data: any[];
    pagination: {
      currentPage: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
      hasNext: boolean;
      hasPrevious: boolean;
    };
  } {
    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return {
      data: data.slice(startIndex, endIndex),
      pagination: {
        currentPage: page,
        pageSize,
        totalItems,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1
      }
    };
  }

  // Data Transformation
  transformData(
    data: any[],
    transformations: Array<{
      field: string;
      operation: 'rename' | 'format' | 'calculate' | 'convert';
      params: any;
    }>
  ): any[] {
    return data.map(item => {
      const transformed = { ...item };
      
      transformations.forEach(transform => {
        switch (transform.operation) {
          case 'rename':
            if (transformed[transform.field] !== undefined) {
              transformed[transform.params.newName] = transformed[transform.field];
              delete transformed[transform.field];
            }
            break;
          
          case 'format':
            if (transformed[transform.field] !== undefined) {
              transformed[transform.field] = this.formatValue(
                transformed[transform.field],
                transform.params.format
              );
            }
            break;
          
          case 'calculate':
            transformed[transform.params.newField] = this.calculateValue(
              transformed,
              transform.params.expression
            );
            break;
          
          case 'convert':
            if (transformed[transform.field] !== undefined) {
              transformed[transform.field] = this.convertValue(
                transformed[transform.field],
                transform.params.from,
                transform.params.to
              );
            }
            break;
        }
      });
      
      return transformed;
    });
  }

  private formatValue(value: any, format: string): any {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(Number(value));
      
      case 'percentage':
        return `${(Number(value) * 100).toFixed(1)}%`;
      
      case 'date':
        return new Date(value).toLocaleDateString();
      
      case 'datetime':
        return new Date(value).toLocaleString();
      
      case 'number':
        return Number(value).toLocaleString();
      
      default:
        return value;
    }
  }

  private calculateValue(item: any, expression: string): any {
    // Simple expression evaluator
    // In a real implementation, you'd use a proper expression parser
    try {
      // Replace field references with actual values
      const evaluableExpression = expression.replace(/\{(\w+)\}/g, (match, field) => {
        const value = this.getNestedValue(item, field);
        return typeof value === 'number' ? value.toString() : '0';
      });
      
      // Evaluate the expression (be careful with eval in production)
      return Function(`"use strict"; return (${evaluableExpression})`)();
    } catch (error) {
      console.error('Error evaluating expression:', expression, error);
      return null;
    }
  }

  private convertValue(value: any, from: string, to: string): any {
    // Type conversion
    switch (`${from}_to_${to}`) {
      case 'string_to_number':
        return Number(value);
      
      case 'number_to_string':
        return String(value);
      
      case 'string_to_date':
        return new Date(value);
      
      case 'date_to_string':
        return new Date(value).toISOString();
      
      case 'boolean_to_string':
        return value ? 'true' : 'false';
      
      case 'string_to_boolean':
        return value.toLowerCase() === 'true';
      
      default:
        return value;
    }
  }

  // Data Validation
  validateData(
    data: any[],
    schema: Array<{
      field: string;
      type: 'string' | 'number' | 'boolean' | 'date' | 'email';
      required?: boolean;
      min?: number;
      max?: number;
      pattern?: string;
    }>
  ): {
    valid: boolean;
    errors: Array<{
      row: number;
      field: string;
      message: string;
    }>;
  } {
    const errors: Array<{
      row: number;
      field: string;
      message: string;
    }> = [];

    data.forEach((item, index) => {
      schema.forEach(rule => {
        const value = this.getNestedValue(item, rule.field);
        
        // Check required fields
        if (rule.required && (value === undefined || value === null || value === '')) {
          errors.push({
            row: index,
            field: rule.field,
            message: `Field ${rule.field} is required`
          });
          return;
        }

        // Skip validation if field is not required and empty
        if (!rule.required && (value === undefined || value === null || value === '')) {
          return;
        }

        // Type validation
        if (!this.validateType(value, rule.type)) {
          errors.push({
            row: index,
            field: rule.field,
            message: `Field ${rule.field} must be of type ${rule.type}`
          });
          return;
        }

        // Range validation for numbers
        if (rule.type === 'number') {
          const numValue = Number(value);
          if (rule.min !== undefined && numValue < rule.min) {
            errors.push({
              row: index,
              field: rule.field,
              message: `Field ${rule.field} must be at least ${rule.min}`
            });
          }
          if (rule.max !== undefined && numValue > rule.max) {
            errors.push({
              row: index,
              field: rule.field,
              message: `Field ${rule.field} must be at most ${rule.max}`
            });
          }
        }

        // Pattern validation for strings
        if (rule.type === 'string' && rule.pattern) {
          const regex = new RegExp(rule.pattern);
          if (!regex.test(String(value))) {
            errors.push({
              row: index,
              field: rule.field,
              message: `Field ${rule.field} does not match required pattern`
            });
          }
        }
      });
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private validateType(value: any, type: string): boolean {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      
      case 'number':
        return typeof value === 'number' || !isNaN(Number(value));
      
      case 'boolean':
        return typeof value === 'boolean';
      
      case 'date':
        return value instanceof Date || !isNaN(Date.parse(value));
      
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return typeof value === 'string' && emailRegex.test(value);
      
      default:
        return true;
    }
  }

  // Data Deduplication
  deduplicateData(
    data: any[],
    keyFields: string[]
  ): {
    deduplicated: any[];
    duplicates: any[];
  } {
    const seen = new Set();
    const deduplicated: any[] = [];
    const duplicates: any[] = [];

    data.forEach(item => {
      const key = keyFields.map(field => this.getNestedValue(item, field)).join('|');
      
      if (seen.has(key)) {
        duplicates.push(item);
      } else {
        seen.add(key);
        deduplicated.push(item);
      }
    });

    return { deduplicated, duplicates };
  }

  // Data Quality Assessment
  assessDataQuality(data: any[]): {
    completeness: number;
    consistency: number;
    accuracy: number;
    issues: Array<{
      type: 'missing' | 'inconsistent' | 'invalid';
      field: string;
      count: number;
      percentage: number;
    }>;
  } {
    if (data.length === 0) {
      return {
        completeness: 0,
        consistency: 0,
        accuracy: 0,
        issues: []
      };
    }

    const fields = Object.keys(data[0]);
    const issues: Array<{
      type: 'missing' | 'inconsistent' | 'invalid';
      field: string;
      count: number;
      percentage: number;
    }> = [];

    let totalFields = 0;
    let completeFields = 0;

    fields.forEach(field => {
      let missingCount = 0;
      let inconsistentCount = 0;
      const values = new Set();

      data.forEach(item => {
        totalFields++;
        const value = this.getNestedValue(item, field);
        
        if (value === undefined || value === null || value === '') {
          missingCount++;
        } else {
          completeFields++;
          values.add(typeof value);
        }
      });

      // Check for missing values
      if (missingCount > 0) {
        issues.push({
          type: 'missing',
          field,
          count: missingCount,
          percentage: (missingCount / data.length) * 100
        });
      }

      // Check for type inconsistency
      if (values.size > 1) {
        issues.push({
          type: 'inconsistent',
          field,
          count: data.length - Math.max(...Array.from(values).map(type => 
            data.filter(item => typeof this.getNestedValue(item, field) === type).length
          )),
          percentage: (inconsistentCount / data.length) * 100
        });
      }
    });

    const completeness = totalFields > 0 ? (completeFields / totalFields) * 100 : 0;
    const consistency = issues.filter(i => i.type === 'inconsistent').length === 0 ? 100 : 80;
    const accuracy = 95; // Mock accuracy score

    return {
      completeness,
      consistency,
      accuracy,
      issues
    };
  }
}