import { RealtimeDataSource } from '@/types/reporting';

export class RealtimeDataManager {
  private static instance: RealtimeDataManager;
  private dataSources: Map<string, RealtimeDataSource> = new Map();
  private subscriptions: Map<string, Set<(data: any) => void>> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();

  public static getInstance(): RealtimeDataManager {
    if (!RealtimeDataManager.instance) {
      RealtimeDataManager.instance = new RealtimeDataManager();
    }
    return RealtimeDataManager.instance;
  }

  // Data Source Management
  async registerDataSource(
    name: string,
    endpoint: string,
    updateInterval: number
  ): Promise<RealtimeDataSource> {
    const dataSource: RealtimeDataSource = {
      id: `datasource_${Date.now()}`,
      name,
      endpoint,
      updateInterval,
      lastUpdated: new Date(),
      status: 'active'
    };

    this.dataSources.set(dataSource.id, dataSource);
    this.startDataPolling(dataSource);
    
    return dataSource;
  }

  async updateDataSource(
    dataSourceId: string,
    updates: Partial<RealtimeDataSource>
  ): Promise<RealtimeDataSource> {
    const dataSource = this.dataSources.get(dataSourceId);
    if (!dataSource) {
      throw new Error(`Data source ${dataSourceId} not found`);
    }

    const updatedDataSource = { ...dataSource, ...updates };
    this.dataSources.set(dataSourceId, updatedDataSource);

    // Restart polling if interval changed
    if (updates.updateInterval && updates.updateInterval !== dataSource.updateInterval) {
      this.stopDataPolling(dataSourceId);
      this.startDataPolling(updatedDataSource);
    }

    return updatedDataSource;
  }

  async removeDataSource(dataSourceId: string): Promise<void> {
    this.stopDataPolling(dataSourceId);
    this.dataSources.delete(dataSourceId);
    this.subscriptions.delete(dataSourceId);
  }

  async getDataSource(dataSourceId: string): Promise<RealtimeDataSource | null> {
    return this.dataSources.get(dataSourceId) || null;
  }

  async getAllDataSources(): Promise<RealtimeDataSource[]> {
    return Array.from(this.dataSources.values());
  }

  // Subscription Management
  subscribe(dataSourceId: string, callback: (data: any) => void): () => void {
    if (!this.subscriptions.has(dataSourceId)) {
      this.subscriptions.set(dataSourceId, new Set());
    }
    
    this.subscriptions.get(dataSourceId)!.add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscriptions.get(dataSourceId);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.subscriptions.delete(dataSourceId);
        }
      }
    };
  }

  // Real-time Data Fetching
  private startDataPolling(dataSource: RealtimeDataSource): void {
    const pollData = async () => {
      try {
        const data = await this.fetchData(dataSource);
        dataSource.lastUpdated = new Date();
        dataSource.status = 'active';
        this.dataSources.set(dataSource.id, dataSource);
        
        // Notify subscribers
        this.notifySubscribers(dataSource.id, data);
      } catch (error) {
        console.error(`Error fetching data from ${dataSource.name}:`, error);
        dataSource.status = 'error';
        this.dataSources.set(dataSource.id, dataSource);
      }
    };

    // Initial fetch
    pollData();

    // Set up interval
    const intervalId = setInterval(pollData, dataSource.updateInterval * 1000);
    this.intervals.set(dataSource.id, intervalId);
  }

  private stopDataPolling(dataSourceId: string): void {
    const intervalId = this.intervals.get(dataSourceId);
    if (intervalId) {
      clearInterval(intervalId);
      this.intervals.delete(dataSourceId);
    }
  }

  private async fetchData(dataSource: RealtimeDataSource): Promise<any> {
    // Mock data fetching based on data source name
    switch (dataSource.name) {
      case 'active_users':
        return this.generateActiveUsersData();
      
      case 'recent_submissions':
        return this.generateRecentSubmissionsData();
      
      case 'system_metrics':
        return this.generateSystemMetricsData();
      
      case 'live_attendance':
        return this.generateLiveAttendanceData();
      
      default:
        return this.generateGenericData(dataSource.name);
    }
  }

  private notifySubscribers(dataSourceId: string, data: any): void {
    const callbacks = this.subscriptions.get(dataSourceId);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in subscriber callback:', error);
        }
      });
    }
  }

  // Mock Data Generators
  private generateActiveUsersData(): any {
    const now = new Date();
    const activeUsers = Math.floor(Math.random() * 100) + 50;
    
    return {
      timestamp: now.toISOString(),
      activeUsers,
      trend: Math.random() > 0.5 ? 'up' : 'down',
      change: Math.floor(Math.random() * 10) - 5
    };
  }

  private generateRecentSubmissionsData(): any {
    const submissions = [];
    const now = new Date();
    
    for (let i = 0; i < 5; i++) {
      submissions.push({
        id: `submission_${Date.now()}_${i}`,
        studentName: `Student ${Math.floor(Math.random() * 100)}`,
        assignmentTitle: `Assignment ${Math.floor(Math.random() * 20)}`,
        submittedAt: new Date(now.getTime() - Math.random() * 3600000).toISOString(),
        status: Math.random() > 0.3 ? 'submitted' : 'late'
      });
    }
    
    return {
      timestamp: now.toISOString(),
      submissions
    };
  }

  private generateSystemMetricsData(): any {
    return {
      timestamp: new Date().toISOString(),
      metrics: {
        cpuUsage: Math.random() * 100,
        memoryUsage: Math.random() * 100,
        diskUsage: Math.random() * 100,
        activeConnections: Math.floor(Math.random() * 1000),
        responseTime: Math.random() * 500
      }
    };
  }

  private generateLiveAttendanceData(): any {
    const courses = ['Math 101', 'Science 201', 'History 301', 'English 401'];
    const attendanceData = courses.map(course => ({
      courseId: `course_${course.replace(' ', '_').toLowerCase()}`,
      courseName: course,
      totalStudents: Math.floor(Math.random() * 30) + 20,
      presentStudents: Math.floor(Math.random() * 25) + 15,
      lateStudents: Math.floor(Math.random() * 5),
      absentStudents: Math.floor(Math.random() * 8)
    }));

    return {
      timestamp: new Date().toISOString(),
      courses: attendanceData
    };
  }

  private generateGenericData(dataSourceName: string): any {
    return {
      timestamp: new Date().toISOString(),
      dataSource: dataSourceName,
      value: Math.random() * 100,
      status: 'active'
    };
  }

  // WebSocket Support (for future implementation)
  async setupWebSocketConnection(
    dataSourceId: string,
    websocketUrl: string
  ): Promise<void> {
    // This would implement WebSocket connection for real-time data
    // For now, it's a placeholder
    console.log(`Setting up WebSocket connection for ${dataSourceId} at ${websocketUrl}`);
  }

  // Data Caching
  private dataCache: Map<string, { data: any; timestamp: Date }> = new Map();

  getCachedData(dataSourceId: string, maxAge: number = 60000): any | null {
    const cached = this.dataCache.get(dataSourceId);
    if (cached && (Date.now() - cached.timestamp.getTime()) < maxAge) {
      return cached.data;
    }
    return null;
  }

  setCachedData(dataSourceId: string, data: any): void {
    this.dataCache.set(dataSourceId, {
      data,
      timestamp: new Date()
    });
  }

  clearCache(dataSourceId?: string): void {
    if (dataSourceId) {
      this.dataCache.delete(dataSourceId);
    } else {
      this.dataCache.clear();
    }
  }

  // Data Aggregation
  async aggregateData(
    dataSourceIds: string[],
    aggregationType: 'sum' | 'avg' | 'min' | 'max' | 'count'
  ): Promise<any> {
    const dataPromises = dataSourceIds.map(async id => {
      const dataSource = this.dataSources.get(id);
      if (dataSource) {
        return await this.fetchData(dataSource);
      }
      return null;
    });

    const results = await Promise.all(dataPromises);
    const validResults = results.filter(result => result !== null);

    switch (aggregationType) {
      case 'sum':
        return validResults.reduce((sum, result) => sum + (result.value || 0), 0);
      
      case 'avg':
        return validResults.length > 0 
          ? validResults.reduce((sum, result) => sum + (result.value || 0), 0) / validResults.length
          : 0;
      
      case 'min':
        return Math.min(...validResults.map(result => result.value || 0));
      
      case 'max':
        return Math.max(...validResults.map(result => result.value || 0));
      
      case 'count':
        return validResults.length;
      
      default:
        return validResults;
    }
  }

  // Cleanup
  destroy(): void {
    // Clear all intervals
    this.intervals.forEach(intervalId => clearInterval(intervalId));
    this.intervals.clear();
    
    // Clear all data
    this.dataSources.clear();
    this.subscriptions.clear();
    this.dataCache.clear();
  }
}