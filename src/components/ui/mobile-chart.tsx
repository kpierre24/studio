"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Button } from "./button";
import { Badge } from "./badge";

// Types
interface ChartData {
  [key: string]: any;
}

interface MobileChartProps {
  data: ChartData[];
  title?: string;
  type: 'line' | 'bar' | 'pie';
  xKey: string;
  yKey: string;
  className?: string;
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  color?: string;
  colors?: string[];
  formatValue?: (value: any) => string;
  formatLabel?: (label: any) => string;
}

const CHART_COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7300', 
  '#00ff00', '#ff00ff', '#00ffff', '#ff0000'
];

export function MobileChart({
  data,
  title,
  type,
  xKey,
  yKey,
  className,
  height = 200,
  showLegend = false,
  showGrid = true,
  color = '#8884d8',
  colors = CHART_COLORS,
  formatValue,
  formatLabel
}: MobileChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Calculate trend for line/bar charts
  const trend = useMemo(() => {
    if (data.length < 2) return null;
    const first = data[0][yKey];
    const last = data[data.length - 1][yKey];
    const change = ((last - first) / first) * 100;
    return {
      direction: change >= 0 ? 'up' : 'down',
      percentage: Math.abs(change).toFixed(1)
    };
  }, [data, yKey]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">
            {formatLabel ? formatLabel(label) : label}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${formatValue ? formatValue(entry.value) : entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" className="opacity-30" />}
              <XAxis 
                dataKey={xKey} 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                tickFormatter={formatLabel}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                tickFormatter={formatValue}
              />
              <Tooltip content={<CustomTooltip />} />
              {showLegend && <Legend />}
              <Line 
                type="monotone" 
                dataKey={yKey} 
                stroke={color}
                strokeWidth={2}
                dot={{ fill: color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" className="opacity-30" />}
              <XAxis 
                dataKey={xKey} 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                tickFormatter={formatLabel}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                tickFormatter={formatValue}
              />
              <Tooltip content={<CustomTooltip />} />
              {showLegend && <Legend />}
              <Bar 
                dataKey={yKey} 
                fill={color}
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={Math.min(height * 0.35, 80)}
                fill={color}
                dataKey={yKey}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      {title && (
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              {type === 'line' && <Activity className="h-4 w-4" />}
              {type === 'bar' && <BarChart3 className="h-4 w-4" />}
              {type === 'pie' && <PieChartIcon className="h-4 w-4" />}
              {title}
            </CardTitle>
            {trend && type !== 'pie' && (
              <Badge variant={trend.direction === 'up' ? 'default' : 'secondary'}>
                {trend.direction === 'up' ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {trend.percentage}%
              </Badge>
            )}
          </div>
        </CardHeader>
      )}
      <CardContent className="p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {renderChart()}
        </motion.div>
      </CardContent>
    </Card>
  );
}

// Responsive chart grid for multiple charts
interface ChartGridProps {
  charts: Array<{
    id: string;
    title: string;
    type: 'line' | 'bar' | 'pie';
    data: ChartData[];
    xKey: string;
    yKey: string;
    color?: string;
    formatValue?: (value: any) => string;
    formatLabel?: (label: any) => string;
  }>;
  className?: string;
}

export function MobileChartGrid({ charts, className }: ChartGridProps) {
  return (
    <div className={cn(
      "grid gap-4",
      "grid-cols-1",
      "sm:grid-cols-2",
      "lg:grid-cols-3",
      className
    )}>
      {charts.map((chart) => (
        <MobileChart
          key={chart.id}
          title={chart.title}
          type={chart.type}
          data={chart.data}
          xKey={chart.xKey}
          yKey={chart.yKey}
          color={chart.color}
          formatValue={chart.formatValue}
          formatLabel={chart.formatLabel}
          height={180}
        />
      ))}
    </div>
  );
}

// Chart summary cards for mobile
interface ChartSummaryProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    period: string;
  };
  chart?: {
    data: ChartData[];
    xKey: string;
    yKey: string;
    color?: string;
  };
  className?: string;
}

export function ChartSummary({
  title,
  value,
  change,
  chart,
  className
}: ChartSummaryProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <div className="flex items-center gap-1 text-sm">
                {change.value >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span className={cn(
                  change.value >= 0 ? "text-green-500" : "text-red-500"
                )}>
                  {Math.abs(change.value)}%
                </span>
                <span className="text-muted-foreground">vs {change.period}</span>
              </div>
            )}
          </div>
          {chart && (
            <div className="w-20 h-12">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chart.data}>
                  <Line 
                    type="monotone" 
                    dataKey={chart.yKey} 
                    stroke={chart.color || '#8884d8'}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}