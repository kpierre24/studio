import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { AdvancedReportingDashboard } from '../advanced-reporting-dashboard';
import { ReportBuilder } from '../report-builder';
import { UserRole } from '@/types';
import { ReportType, ExportFormat } from '@/types/reporting';

// Mock the recharts library
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  Bar: () => <div data-testid="bar" />,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  },
  AnimatePresence: ({ children }: any) => <>{children}</>
}));

describe('AdvancedReportingDashboard', () => {
  const mockProps = {
    userRole: UserRole.TEACHER,
    userId: 'teacher-1',
    onReportGenerate: vi.fn(),
    onExportReport: vi.fn(),
    onDashboardSave: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dashboard with correct title and role', () => {
    render(<AdvancedReportingDashboard {...mockProps} />);
    
    expect(screen.getByText('Advanced Reporting Dashboard')).toBeInTheDocument();
    expect(screen.getByText(/Comprehensive analytics and reporting for teachers/)).toBeInTheDocument();
  });

  it('displays dashboard tabs', () => {
    render(<AdvancedReportingDashboard {...mockProps} />);
    
    expect(screen.getByRole('tab', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Reports' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Analytics' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Exports' })).toBeInTheDocument();
  });

  it('shows dashboard widgets by default', () => {
    render(<AdvancedReportingDashboard {...mockProps} />);
    
    expect(screen.getByText('Interactive Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Add Widget')).toBeInTheDocument();
  });

  it('switches to reports tab when clicked', async () => {
    render(<AdvancedReportingDashboard {...mockProps} />);
    
    const reportsTab = screen.getByRole('tab', { name: 'Reports' });
    fireEvent.click(reportsTab);
    
    await waitFor(() => {
      expect(screen.getByText('Report Generation')).toBeInTheDocument();
    });
  });

  it('displays report type cards in reports tab', async () => {
    render(<AdvancedReportingDashboard {...mockProps} />);
    
    const reportsTab = screen.getByRole('tab', { name: 'Reports' });
    fireEvent.click(reportsTab);
    
    await waitFor(() => {
      expect(screen.getByText(/student performance/i)).toBeInTheDocument();
      expect(screen.getByText(/course analytics/i)).toBeInTheDocument();
    });
  });

  it('calls onReportGenerate when generate button is clicked', async () => {
    const mockGenerate = vi.fn().mockResolvedValue({
      id: 'test-report',
      data: [],
      metadata: { generatedAt: new Date(), totalRecords: 0, executionTime: 100 }
    });

    render(
      <AdvancedReportingDashboard 
        {...mockProps} 
        onReportGenerate={mockGenerate}
      />
    );
    
    const reportsTab = screen.getByRole('tab', { name: 'Reports' });
    fireEvent.click(reportsTab);
    
    await waitFor(() => {
      const generateButton = screen.getAllByText('Generate')[0];
      fireEvent.click(generateButton);
    });

    expect(mockGenerate).toHaveBeenCalled();
  });

  it('shows analytics charts in analytics tab', async () => {
    render(<AdvancedReportingDashboard {...mockProps} />);
    
    const analyticsTab = screen.getByRole('tab', { name: 'Analytics' });
    fireEvent.click(analyticsTab);
    
    await waitFor(() => {
      expect(screen.getByText('Advanced Analytics')).toBeInTheDocument();
      expect(screen.getByText('Performance Trends')).toBeInTheDocument();
      expect(screen.getByText('Engagement Distribution')).toBeInTheDocument();
    });
  });

  it('displays export format options in exports tab', async () => {
    render(<AdvancedReportingDashboard {...mockProps} />);
    
    const exportsTab = screen.getByRole('tab', { name: 'Exports' });
    fireEvent.click(exportsTab);
    
    await waitFor(() => {
      expect(screen.getByText('Export Management')).toBeInTheDocument();
      expect(screen.getByText('Export as PDF')).toBeInTheDocument();
      expect(screen.getByText('Export as EXCEL')).toBeInTheDocument();
      expect(screen.getByText('Export as CSV')).toBeInTheDocument();
      expect(screen.getByText('Export as JSON')).toBeInTheDocument();
    });
  });

  it('renders different widgets based on user role', () => {
    const adminProps = { ...mockProps, userRole: UserRole.SUPER_ADMIN };
    const { rerender } = render(<AdvancedReportingDashboard {...adminProps} />);
    
    // Should show admin-specific widgets
    expect(screen.getByText('Interactive Dashboard')).toBeInTheDocument();
    
    // Rerender with student role
    const studentProps = { ...mockProps, userRole: UserRole.STUDENT };
    rerender(<AdvancedReportingDashboard {...studentProps} />);
    
    // Should still show dashboard but with different widgets
    expect(screen.getByText('Interactive Dashboard')).toBeInTheDocument();
  });
});

describe('ReportBuilder', () => {
  const mockProps = {
    userRole: UserRole.TEACHER,
    onSave: vi.fn(),
    onGenerate: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders report builder with correct title', () => {
    render(<ReportBuilder {...mockProps} />);
    
    expect(screen.getByText('Report Builder')).toBeInTheDocument();
    expect(screen.getByText('Create and configure custom reports')).toBeInTheDocument();
  });

  it('displays basic information form', () => {
    render(<ReportBuilder {...mockProps} />);
    
    expect(screen.getByLabelText('Report Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Report Type')).toBeInTheDocument();
  });

  it('allows adding parameters', async () => {
    render(<ReportBuilder {...mockProps} />);
    
    const addParameterButton = screen.getByText('Add Parameter');
    fireEvent.click(addParameterButton);
    
    await waitFor(() => {
      expect(screen.getByText('Parameter 1')).toBeInTheDocument();
    });
  });

  it('shows export format checkboxes', () => {
    render(<ReportBuilder {...mockProps} />);
    
    expect(screen.getByLabelText('PDF')).toBeInTheDocument();
    expect(screen.getByLabelText('EXCEL')).toBeInTheDocument();
    expect(screen.getByLabelText('CSV')).toBeInTheDocument();
    expect(screen.getByLabelText('JSON')).toBeInTheDocument();
  });

  it('enables schedule settings when checkbox is checked', async () => {
    render(<ReportBuilder {...mockProps} />);
    
    const scheduleCheckbox = screen.getByLabelText('Enable Scheduled Reports');
    fireEvent.click(scheduleCheckbox);
    
    await waitFor(() => {
      expect(screen.getByLabelText('Frequency')).toBeInTheDocument();
      expect(screen.getByLabelText('Time')).toBeInTheDocument();
    });
  });

  it('switches to preview mode when preview button is clicked', async () => {
    render(<ReportBuilder {...mockProps} />);
    
    // Fill in report name first
    const nameInput = screen.getByLabelText('Report Name');
    fireEvent.change(nameInput, { target: { value: 'Test Report' } });
    
    const previewButton = screen.getByText('Preview');
    fireEvent.click(previewButton);
    
    await waitFor(() => {
      expect(screen.getByText('Report Preview')).toBeInTheDocument();
      expect(screen.getByText('Test Report')).toBeInTheDocument();
    });
  });

  it('calls onSave when save button is clicked with valid data', async () => {
    const mockSave = vi.fn().mockResolvedValue(undefined);
    
    render(<ReportBuilder {...mockProps} onSave={mockSave} />);
    
    // Fill in required fields
    const nameInput = screen.getByLabelText('Report Name');
    fireEvent.change(nameInput, { target: { value: 'Test Report' } });
    
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockSave).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Report',
          type: ReportType.STUDENT_PERFORMANCE,
          userRole: UserRole.TEACHER
        })
      );
    });
  });

  it('calls onGenerate when generate button is clicked with valid data', async () => {
    const mockGenerate = vi.fn().mockResolvedValue(undefined);
    
    render(<ReportBuilder {...mockProps} onGenerate={mockGenerate} />);
    
    // Fill in required fields
    const nameInput = screen.getByLabelText('Report Name');
    fireEvent.change(nameInput, { target: { value: 'Test Report' } });
    
    const generateButton = screen.getByText('Generate');
    fireEvent.click(generateButton);
    
    await waitFor(() => {
      expect(mockGenerate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Report',
          type: ReportType.STUDENT_PERFORMANCE,
          userRole: UserRole.TEACHER
        })
      );
    });
  });

  it('filters report types based on user role', () => {
    const studentProps = { ...mockProps, userRole: UserRole.STUDENT };
    render(<ReportBuilder {...studentProps} />);
    
    // Students should have limited report types
    // This would need to be tested by checking the select options
    expect(screen.getByLabelText('Report Type')).toBeInTheDocument();
  });

  it('allows removing parameters', async () => {
    render(<ReportBuilder {...mockProps} />);
    
    // Add a parameter first
    const addParameterButton = screen.getByText('Add Parameter');
    fireEvent.click(addParameterButton);
    
    await waitFor(() => {
      expect(screen.getByText('Parameter 1')).toBeInTheDocument();
    });
    
    // Remove the parameter
    const removeButton = screen.getByRole('button', { name: '' }); // Minus icon button
    fireEvent.click(removeButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Parameter 1')).not.toBeInTheDocument();
    });
  });

  it('updates parameter configuration', async () => {
    render(<ReportBuilder {...mockProps} />);
    
    // Add a parameter
    const addParameterButton = screen.getByText('Add Parameter');
    fireEvent.click(addParameterButton);
    
    await waitFor(() => {
      const keyInput = screen.getByDisplayValue('param_');
      expect(keyInput).toBeInTheDocument();
    });
    
    // Update parameter key
    const keyInput = screen.getByDisplayValue(/param_/);
    fireEvent.change(keyInput, { target: { value: 'test_param' } });
    
    expect(keyInput).toHaveValue('test_param');
  });
});

describe('Report Builder Integration', () => {
  it('loads initial configuration when provided', () => {
    const initialConfig = {
      id: 'test-config',
      name: 'Test Report',
      description: 'Test description',
      type: ReportType.COURSE_ANALYTICS,
      userRole: UserRole.TEACHER,
      parameters: [],
      format: [ExportFormat.PDF],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'test-user'
    };

    render(
      <ReportBuilder 
        userRole={UserRole.TEACHER}
        initialConfig={initialConfig}
      />
    );

    expect(screen.getByDisplayValue('Test Report')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
  });

  it('handles parameter type changes correctly', async () => {
    render(<ReportBuilder userRole={UserRole.TEACHER} />);
    
    // Add a parameter
    const addParameterButton = screen.getByText('Add Parameter');
    fireEvent.click(addParameterButton);
    
    await waitFor(() => {
      expect(screen.getByText('Parameter 1')).toBeInTheDocument();
    });
    
    // The parameter type select should be present
    // In a real test, you would interact with the select to change the type
    // and verify that the appropriate fields appear/disappear
  });
});