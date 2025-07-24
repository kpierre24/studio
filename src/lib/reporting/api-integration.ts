import { AnalyticsAPI, ReportData, ExportFormat } from '@/types/reporting';

export class AnalyticsAPIManager {
  private static instance: AnalyticsAPIManager;
  private apiConfigurations: Map<string, AnalyticsAPI> = new Map();

  public static getInstance(): AnalyticsAPIManager {
    if (!AnalyticsAPIManager.instance) {
      AnalyticsAPIManager.instance = new AnalyticsAPIManager();
    }
    return AnalyticsAPIManager.instance;
  }

  // API Configuration Management
  async registerAPI(
    name: string,
    config: AnalyticsAPI
  ): Promise<void> {
    this.apiConfigurations.set(name, config);
  }

  async updateAPI(
    name: string,
    updates: Partial<AnalyticsAPI>
  ): Promise<void> {
    const existing = this.apiConfigurations.get(name);
    if (!existing) {
      throw new Error(`API configuration ${name} not found`);
    }
    
    this.apiConfigurations.set(name, { ...existing, ...updates });
  }

  async removeAPI(name: string): Promise<void> {
    this.apiConfigurations.delete(name);
  }

  async getAPI(name: string): Promise<AnalyticsAPI | null> {
    return this.apiConfigurations.get(name) || null;
  }

  async getAllAPIs(): Promise<Record<string, AnalyticsAPI>> {
    return Object.fromEntries(this.apiConfigurations.entries());
  }

  // Data Export to External Systems
  async exportToExternalSystem(
    apiName: string,
    reportData: ReportData,
    options?: {
      format?: ExportFormat;
      transform?: (data: any) => any;
      metadata?: Record<string, any>;
    }
  ): Promise<{
    success: boolean;
    response?: any;
    error?: string;
  }> {
    const apiConfig = this.apiConfigurations.get(apiName);
    if (!apiConfig) {
      return {
        success: false,
        error: `API configuration ${apiName} not found`
      };
    }

    try {
      let exportData = reportData.data;
      
      // Apply transformation if provided
      if (options?.transform) {
        exportData = options.transform(exportData);
      }

      // Format data based on API requirements
      const formattedData = this.formatDataForAPI(exportData, apiConfig, options?.format);

      // Prepare request
      const requestOptions = await this.prepareRequest(apiConfig, formattedData, options?.metadata);

      // Make API call
      const response = await fetch(apiConfig.endpoint, requestOptions);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const responseData = apiConfig.responseFormat === 'json' 
        ? await response.json()
        : await response.text();

      return {
        success: true,
        response: responseData
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Batch Export
  async batchExportToExternalSystem(
    apiName: string,
    reports: ReportData[],
    options?: {
      format?: ExportFormat;
      transform?: (data: any) => any;
      metadata?: Record<string, any>;
      batchSize?: number;
    }
  ): Promise<{
    success: boolean;
    results: Array<{
      reportId: string;
      success: boolean;
      response?: any;
      error?: string;
    }>;
  }> {
    const batchSize = options?.batchSize || 10;
    const results: Array<{
      reportId: string;
      success: boolean;
      response?: any;
      error?: string;
    }> = [];

    // Process reports in batches
    for (let i = 0; i < reports.length; i += batchSize) {
      const batch = reports.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async report => {
        const result = await this.exportToExternalSystem(apiName, report, options);
        return {
          reportId: report.id,
          ...result
        };
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Add delay between batches to avoid rate limiting
      if (i + batchSize < reports.length) {
        await this.delay(1000);
      }
    }

    const successCount = results.filter(r => r.success).length;
    
    return {
      success: successCount === results.length,
      results
    };
  }

  // Data Import from External Systems
  async importFromExternalSystem(
    apiName: string,
    parameters?: Record<string, any>
  ): Promise<{
    success: boolean;
    data?: any[];
    error?: string;
  }> {
    const apiConfig = this.apiConfigurations.get(apiName);
    if (!apiConfig) {
      return {
        success: false,
        error: `API configuration ${apiName} not found`
      };
    }

    try {
      // Prepare request for data import
      const requestOptions = await this.prepareRequest(apiConfig, null, parameters);
      
      // Make API call
      const response = await fetch(apiConfig.endpoint, requestOptions);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      let responseData;
      switch (apiConfig.responseFormat) {
        case 'json':
          responseData = await response.json();
          break;
        case 'xml':
          responseData = await this.parseXML(await response.text());
          break;
        case 'csv':
          responseData = await this.parseCSV(await response.text());
          break;
        default:
          responseData = await response.text();
      }

      return {
        success: true,
        data: Array.isArray(responseData) ? responseData : [responseData]
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Webhook Management
  async registerWebhook(
    name: string,
    endpoint: string,
    events: string[],
    secret?: string
  ): Promise<string> {
    const webhookId = `webhook_${Date.now()}`;
    
    // In a real implementation, this would register with the external service
    console.log(`Registered webhook ${webhookId} for events: ${events.join(', ')}`);
    
    return webhookId;
  }

  async handleWebhook(
    webhookId: string,
    payload: any,
    signature?: string
  ): Promise<{
    success: boolean;
    processed: boolean;
    error?: string;
  }> {
    try {
      // Verify webhook signature if provided
      if (signature) {
        const isValid = await this.verifyWebhookSignature(payload, signature);
        if (!isValid) {
          return {
            success: false,
            processed: false,
            error: 'Invalid webhook signature'
          };
        }
      }

      // Process webhook payload
      await this.processWebhookPayload(webhookId, payload);

      return {
        success: true,
        processed: true
      };

    } catch (error) {
      return {
        success: false,
        processed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // API Health Monitoring
  async checkAPIHealth(apiName: string): Promise<{
    status: 'healthy' | 'unhealthy' | 'unknown';
    responseTime?: number;
    error?: string;
  }> {
    const apiConfig = this.apiConfigurations.get(apiName);
    if (!apiConfig) {
      return {
        status: 'unknown',
        error: `API configuration ${apiName} not found`
      };
    }

    const startTime = Date.now();

    try {
      // Make a simple health check request
      const response = await fetch(apiConfig.endpoint, {
        method: 'HEAD',
        timeout: 5000
      } as any);

      const responseTime = Date.now() - startTime;

      return {
        status: response.ok ? 'healthy' : 'unhealthy',
        responseTime,
        error: response.ok ? undefined : `HTTP ${response.status}`
      };

    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Helper Methods
  private formatDataForAPI(
    data: any[],
    apiConfig: AnalyticsAPI,
    format?: ExportFormat
  ): any {
    switch (format || ExportFormat.JSON) {
      case ExportFormat.JSON:
        return JSON.stringify(data);
      
      case ExportFormat.CSV:
        return this.convertToCSV(data);
      
      // case ExportFormat.XML: // XML format not supported
        return this.convertToXML(data);
      
      default:
        return data;
    }
  }

  private async prepareRequest(
    apiConfig: AnalyticsAPI,
    data?: any,
    metadata?: Record<string, any>
  ): Promise<RequestInit> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    // Add authentication
    switch (apiConfig.authentication) {
      case 'apiKey':
        headers['Authorization'] = `Bearer ${apiConfig.parameters.apiKey}`;
        break;
      
      case 'basic':
        const credentials = btoa(`${apiConfig.parameters.username}:${apiConfig.parameters.password}`);
        headers['Authorization'] = `Basic ${credentials}`;
        break;
      
      case 'oauth':
        // In a real implementation, you'd handle OAuth token refresh
        headers['Authorization'] = `Bearer ${apiConfig.parameters.accessToken}`;
        break;
    }

    const requestOptions: RequestInit = {
      method: apiConfig.method,
      headers
    };

    if (data && apiConfig.method !== 'GET') {
      requestOptions.body = typeof data === 'string' ? data : JSON.stringify(data);
    }

    return requestOptions;
  }

  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      });
      csvRows.push(values.join(','));
    });

    return csvRows.join('\n');
  }

  private convertToXML(data: any[]): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<data>\n';
    
    data.forEach(item => {
      xml += '  <item>\n';
      Object.entries(item).forEach(([key, value]) => {
        xml += `    <${key}>${value}</${key}>\n`;
      });
      xml += '  </item>\n';
    });
    
    xml += '</data>';
    return xml;
  }

  private async parseXML(xmlString: string): Promise<any> {
    // Simplified XML parsing - in reality, you'd use a proper XML parser
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    
    // Convert XML to JSON (simplified)
    return { parsed: 'XML parsing not fully implemented' };
  }

  private async parseCSV(csvString: string): Promise<any[]> {
    const lines = csvString.split('\n');
    if (lines.length === 0) return [];

    const headers = lines[0].split(',');
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',');
        const row: any = {};
        headers.forEach((header, index) => {
          row[header.trim()] = values[index]?.trim() || '';
        });
        data.push(row);
      }
    }

    return data;
  }

  private async verifyWebhookSignature(
    payload: any,
    signature: string
  ): Promise<boolean> {
    // Simplified signature verification
    // In reality, you'd use proper HMAC verification
    return signature.length > 0;
  }

  private async processWebhookPayload(
    webhookId: string,
    payload: any
  ): Promise<void> {
    // Process the webhook payload
    console.log(`Processing webhook ${webhookId}:`, payload);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}