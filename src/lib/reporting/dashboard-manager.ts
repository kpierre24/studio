import { 
  DashboardLayout, 
  DashboardWidget, 
  WidgetType, 
  WidgetConfig 
} from '@/types/reporting';
import { UserRole } from '@/types';

export class DashboardManager {
  private static instance: DashboardManager;
  private layouts: Map<string, DashboardLayout> = new Map();
  private widgets: Map<string, DashboardWidget> = new Map();

  public static getInstance(): DashboardManager {
    if (!DashboardManager.instance) {
      DashboardManager.instance = new DashboardManager();
    }
    return DashboardManager.instance;
  }

  // Dashboard Layout Management
  async createDashboardLayout(
    name: string,
    userRole: UserRole,
    widgets: DashboardWidget[],
    createdBy: string,
    isDefault: boolean = false
  ): Promise<DashboardLayout> {
    const layout: DashboardLayout = {
      id: `layout_${Date.now()}`,
      name,
      userRole,
      widgets,
      isDefault,
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.layouts.set(layout.id, layout);
    return layout;
  }

  async updateDashboardLayout(
    layoutId: string,
    updates: Partial<DashboardLayout>
  ): Promise<DashboardLayout> {
    const layout = this.layouts.get(layoutId);
    if (!layout) {
      throw new Error(`Dashboard layout ${layoutId} not found`);
    }

    const updatedLayout = {
      ...layout,
      ...updates,
      updatedAt: new Date()
    };

    this.layouts.set(layoutId, updatedLayout);
    return updatedLayout;
  }

  async deleteDashboardLayout(layoutId: string): Promise<void> {
    if (!this.layouts.has(layoutId)) {
      throw new Error(`Dashboard layout ${layoutId} not found`);
    }
    this.layouts.delete(layoutId);
  }

  async getDashboardLayout(layoutId: string): Promise<DashboardLayout | null> {
    return this.layouts.get(layoutId) || null;
  }

  async getDashboardLayoutsByRole(userRole: UserRole): Promise<DashboardLayout[]> {
    return Array.from(this.layouts.values()).filter(layout => layout.userRole === userRole);
  }

  async getDefaultDashboardLayout(userRole: UserRole): Promise<DashboardLayout | null> {
    const layouts = await this.getDashboardLayoutsByRole(userRole);
    return layouts.find(layout => layout.isDefault) || null;
  }

  // Widget Management
  async createWidget(
    type: WidgetType,
    title: string,
    position: { x: number; y: number; w: number; h: number },
    config: WidgetConfig,
    dataSource: string,
    userRole: UserRole,
    refreshInterval?: number
  ): Promise<DashboardWidget> {
    const widget: DashboardWidget = {
      id: `widget_${Date.now()}`,
      type,
      title,
      position,
      config,
      dataSource,
      userRole,
      refreshInterval
    };

    this.widgets.set(widget.id, widget);
    return widget;
  }

  async updateWidget(
    widgetId: string,
    updates: Partial<DashboardWidget>
  ): Promise<DashboardWidget> {
    const widget = this.widgets.get(widgetId);
    if (!widget) {
      throw new Error(`Widget ${widgetId} not found`);
    }

    const updatedWidget = { ...widget, ...updates };
    this.widgets.set(widgetId, updatedWidget);
    return updatedWidget;
  }

  async deleteWidget(widgetId: string): Promise<void> {
    if (!this.widgets.has(widgetId)) {
      throw new Error(`Widget ${widgetId} not found`);
    }
    this.widgets.delete(widgetId);
  }

  async getWidget(widgetId: string): Promise<DashboardWidget | null> {
    return this.widgets.get(widgetId) || null;
  }

  async getWidgetsByRole(userRole: UserRole): Promise<DashboardWidget[]> {
    return Array.from(this.widgets.values()).filter(widget => widget.userRole === userRole);
  }

  // Default Dashboard Configurations
  async createDefaultDashboards(): Promise<void> {
    // Super Admin Dashboard
    await this.createDefaultSuperAdminDashboard();
    
    // Teacher Dashboard
    await this.createDefaultTeacherDashboard();
    
    // Student Dashboard
    await this.createDefaultStudentDashboard();
  }

  private async createDefaultSuperAdminDashboard(): Promise<void> {
    const widgets: DashboardWidget[] = [
      await this.createWidget(
        WidgetType.METRIC_CARD,
        'Total Users',
        { x: 0, y: 0, w: 3, h: 2 },
        { aggregation: 'count' },
        'users',
        UserRole.SUPER_ADMIN
      ),
      await this.createWidget(
        WidgetType.METRIC_CARD,
        'Total Courses',
        { x: 3, y: 0, w: 3, h: 2 },
        { aggregation: 'count' },
        'courses',
        UserRole.SUPER_ADMIN
      ),
      await this.createWidget(
        WidgetType.METRIC_CARD,
        'Total Revenue',
        { x: 6, y: 0, w: 3, h: 2 },
        { aggregation: 'sum' },
        'payments',
        UserRole.SUPER_ADMIN
      ),
      await this.createWidget(
        WidgetType.CHART,
        'User Registration Trends',
        { x: 0, y: 2, w: 6, h: 4 },
        { 
          chartType: 'line',
          showGrid: true,
          showLegend: true
        },
        'user_registrations',
        UserRole.SUPER_ADMIN
      ),
      await this.createWidget(
        WidgetType.CHART,
        'Revenue by Course',
        { x: 6, y: 2, w: 6, h: 4 },
        { 
          chartType: 'bar',
          showGrid: true,
          showLegend: false
        },
        'course_revenue',
        UserRole.SUPER_ADMIN
      ),
      await this.createWidget(
        WidgetType.TABLE,
        'Recent Activities',
        { x: 0, y: 6, w: 12, h: 4 },
        {},
        'recent_activities',
        UserRole.SUPER_ADMIN
      )
    ];

    await this.createDashboardLayout(
      'Super Admin Dashboard',
      UserRole.SUPER_ADMIN,
      widgets,
      'system',
      true
    );
  }

  private async createDefaultTeacherDashboard(): Promise<void> {
    const widgets: DashboardWidget[] = [
      await this.createWidget(
        WidgetType.METRIC_CARD,
        'My Courses',
        { x: 0, y: 0, w: 3, h: 2 },
        { aggregation: 'count' },
        'teacher_courses',
        UserRole.TEACHER
      ),
      await this.createWidget(
        WidgetType.METRIC_CARD,
        'Total Students',
        { x: 3, y: 0, w: 3, h: 2 },
        { aggregation: 'count' },
        'enrolled_students',
        UserRole.TEACHER
      ),
      await this.createWidget(
        WidgetType.METRIC_CARD,
        'Pending Submissions',
        { x: 6, y: 0, w: 3, h: 2 },
        { aggregation: 'count' },
        'pending_submissions',
        UserRole.TEACHER
      ),
      await this.createWidget(
        WidgetType.CHART,
        'Class Performance',
        { x: 0, y: 2, w: 6, h: 4 },
        { 
          chartType: 'bar',
          showGrid: true,
          showLegend: true
        },
        'class_performance',
        UserRole.TEACHER
      ),
      await this.createWidget(
        WidgetType.CHART,
        'Attendance Trends',
        { x: 6, y: 2, w: 6, h: 4 },
        { 
          chartType: 'line',
          showGrid: true,
          showLegend: false
        },
        'attendance_trends',
        UserRole.TEACHER
      ),
      await this.createWidget(
        WidgetType.LIST,
        'Recent Submissions',
        { x: 0, y: 6, w: 6, h: 4 },
        {},
        'recent_submissions',
        UserRole.TEACHER
      ),
      await this.createWidget(
        WidgetType.LIST,
        'Upcoming Deadlines',
        { x: 6, y: 6, w: 6, h: 4 },
        {},
        'upcoming_deadlines',
        UserRole.TEACHER
      )
    ];

    await this.createDashboardLayout(
      'Teacher Dashboard',
      UserRole.TEACHER,
      widgets,
      'system',
      true
    );
  }

  private async createDefaultStudentDashboard(): Promise<void> {
    const widgets: DashboardWidget[] = [
      await this.createWidget(
        WidgetType.METRIC_CARD,
        'Enrolled Courses',
        { x: 0, y: 0, w: 3, h: 2 },
        { aggregation: 'count' },
        'student_courses',
        UserRole.STUDENT
      ),
      await this.createWidget(
        WidgetType.METRIC_CARD,
        'Average Grade',
        { x: 3, y: 0, w: 3, h: 2 },
        { aggregation: 'avg' },
        'student_grades',
        UserRole.STUDENT
      ),
      await this.createWidget(
        WidgetType.METRIC_CARD,
        'Attendance Rate',
        { x: 6, y: 0, w: 3, h: 2 },
        { aggregation: 'avg' },
        'student_attendance',
        UserRole.STUDENT
      ),
      await this.createWidget(
        WidgetType.PROGRESS_BAR,
        'Course Progress',
        { x: 0, y: 2, w: 6, h: 3 },
        {},
        'course_progress',
        UserRole.STUDENT
      ),
      await this.createWidget(
        WidgetType.CHART,
        'Grade Trends',
        { x: 6, y: 2, w: 6, h: 3 },
        { 
          chartType: 'line',
          showGrid: true,
          showLegend: false
        },
        'grade_trends',
        UserRole.STUDENT
      ),
      await this.createWidget(
        WidgetType.LIST,
        'Upcoming Assignments',
        { x: 0, y: 5, w: 6, h: 4 },
        {},
        'upcoming_assignments',
        UserRole.STUDENT
      ),
      await this.createWidget(
        WidgetType.LIST,
        'Recent Grades',
        { x: 6, y: 5, w: 6, h: 4 },
        {},
        'recent_grades',
        UserRole.STUDENT
      )
    ];

    await this.createDashboardLayout(
      'Student Dashboard',
      UserRole.STUDENT,
      widgets,
      'system',
      true
    );
  }

  // Widget Data Processing
  async processWidgetData(widget: DashboardWidget, rawData: any[]): Promise<any> {
    switch (widget.type) {
      case WidgetType.METRIC_CARD:
        return this.processMetricCardData(widget, rawData);
      
      case WidgetType.CHART:
        return this.processChartData(widget, rawData);
      
      case WidgetType.TABLE:
        return this.processTableData(widget, rawData);
      
      case WidgetType.PROGRESS_BAR:
        return this.processProgressBarData(widget, rawData);
      
      case WidgetType.LIST:
        return this.processListData(widget, rawData);
      
      case WidgetType.GAUGE:
        return this.processGaugeData(widget, rawData);
      
      case WidgetType.HEATMAP:
        return this.processHeatmapData(widget, rawData);
      
      default:
        return rawData;
    }
  }

  private processMetricCardData(widget: DashboardWidget, rawData: any[]): any {
    const { aggregation } = widget.config;
    
    switch (aggregation) {
      case 'count':
        return { value: rawData.length };
      
      case 'sum':
        return { 
          value: rawData.reduce((sum, item) => sum + (item.value || 0), 0) 
        };
      
      case 'avg':
        const values = rawData.map(item => item.value || 0);
        return { 
          value: values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0 
        };
      
      case 'min':
        return { 
          value: Math.min(...rawData.map(item => item.value || 0)) 
        };
      
      case 'max':
        return { 
          value: Math.max(...rawData.map(item => item.value || 0)) 
        };
      
      default:
        return { value: rawData.length };
    }
  }

  private processChartData(widget: DashboardWidget, rawData: any[]): any {
    const { chartType, groupBy } = widget.config;
    
    if (groupBy) {
      const grouped = rawData.reduce((acc, item) => {
        const key = item[groupBy];
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      }, {});

      return {
        labels: Object.keys(grouped),
        datasets: [{
          data: Object.values(grouped).map((group: any) => group.length),
          backgroundColor: widget.config.colors || ['#3B82F6', '#EF4444', '#10B981', '#F59E0B']
        }]
      };
    }

    return {
      labels: rawData.map(item => item.label || item.name),
      datasets: [{
        data: rawData.map(item => item.value),
        backgroundColor: widget.config.colors || ['#3B82F6']
      }]
    };
  }

  private processTableData(widget: DashboardWidget, rawData: any[]): any {
    return {
      columns: Object.keys(rawData[0] || {}),
      rows: rawData
    };
  }

  private processProgressBarData(widget: DashboardWidget, rawData: any[]): any {
    return rawData.map(item => ({
      label: item.label || item.name,
      value: item.value,
      max: item.max || 100,
      percentage: ((item.value / (item.max || 100)) * 100).toFixed(1)
    }));
  }

  private processListData(widget: DashboardWidget, rawData: any[]): any {
    return rawData.slice(0, 10); // Limit to 10 items for lists
  }

  private processGaugeData(widget: DashboardWidget, rawData: any[]): any {
    const value = rawData.length > 0 ? rawData[0].value : 0;
    const max = rawData.length > 0 ? rawData[0].max || 100 : 100;
    
    return {
      value,
      max,
      percentage: ((value / max) * 100).toFixed(1)
    };
  }

  private processHeatmapData(widget: DashboardWidget, rawData: any[]): any {
    // Process data for heatmap visualization
    return rawData.map(item => ({
      x: item.x || item.date,
      y: item.y || item.category,
      value: item.value || item.count
    }));
  }
}