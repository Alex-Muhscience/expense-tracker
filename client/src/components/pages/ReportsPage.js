import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, subDays } from 'date-fns';
import ReportsList from '../dashboard/reports/ReportsList';
import DateRangePicker from '../ui/DateRangePicker/DateRangePicker';
import Button from '../ui/Button/Button';
import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  ChartBarIcon,
  CalendarIcon,
  ShareIcon,
  ClockIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../context/ThemeContext';
import LoadingSpinner from '../shared/Loading/LoadingSpinner';
import ErrorMessage from '../shared/ErrorMessage/ErrorMessage';
import EmptyState from '../shared/EmptyState/EmptyState';
import axios from '../../services/api';
import ExportModal from '../dashboard/reports/ExportModal';
import ReportTypeSelector from '../dashboard/reports/ReportTypeSelector';
import ReportVisualization from '../dashboard/reports/ReportVisualization';
import ScheduleModal from '../dashboard/reports/ScheduleModal';
import ShareModal from '../dashboard/reports/ShareModal';
import TemplateModal from '../dashboard/reports/TemplateModal';
import Pagination from '../ui/Pagination/Pagination';
import '../../index.css';

const REPORT_TYPES = [
  { id: 'expenses', name: 'Expenses' },
  { id: 'income', name: 'Income' },
  { id: 'budget', name: 'Budget' },
  { id: 'cashflow', name: 'Cash Flow' },
  { id: 'category', name: 'Category Breakdown' },
  { id: 'trends', name: 'Spending Trends' },
  { id: 'vendor', name: 'Vendor Analysis' }
];

export default function ReportsPage() {
  const { isDarkMode } = useTheme();
  const [showExportModal, setShowExportModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [reportType, setReportType] = useState('expenses');
  const [dateRange, setDateRange] = useState({
    startDate: subDays(new Date(), 30),
    endDate: new Date(),
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {
    data: reportData,
    isLoading,
    error,
    refetch
  } = useQuery(
    ['reports', dateRange, reportType, page, pageSize],
    () => fetchReports(dateRange, reportType, page, pageSize),
    {
      keepPreviousData: true,
      staleTime: 300000 // 5 minutes
    }
  );

  const handleDateRangeChange = (newRange) => {
    setDateRange(newRange);
    setPage(1); // Reset to first page when date range changes
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleExport = () => {
    setShowExportModal(true);
  };

  const handleSchedule = () => {
    setShowScheduleModal(true);
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleTemplate = () => {
    setShowTemplateModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Reports</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Analyze your financial data
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <ReportTypeSelector
            value={reportType}
            onChange={(type) => {
              setReportType(type);
              setPage(1);
            }}
            options={REPORT_TYPES}
          />
          <Button
            variant="secondary"
            onClick={handleRefresh}
            disabled={isLoading}
            aria-label="Refresh reports"
          >
            <ArrowPathIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="secondary"
            onClick={handleExport}
            icon={<ArrowDownTrayIcon className="h-5 w-5 mr-2" />}
          >
            Export
          </Button>
          <Button
            variant="secondary"
            onClick={handleSchedule}
            icon={<ClockIcon className="h-5 w-5 mr-2" />}
          >
            Schedule
          </Button>
          <Button
            variant="secondary"
            onClick={handleShare}
            icon={<ShareIcon className="h-5 w-5 mr-2" />}
          >
            Share
          </Button>
          <Button
            variant="secondary"
            onClick={handleTemplate}
            icon={<BeakerIcon className="h-5 w-5 mr-2" />}
          >
            Templates
          </Button>
        </div>
      </div>

      <div className={`rounded-lg shadow p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date Range
            </label>
            <DateRangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
            />
          </div>
          <div className="flex items-end">
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <CalendarIcon className="h-4 w-4 mr-1" />
              <span>
                {format(dateRange.startDate, 'MMM d, yyyy')} - {format(dateRange.endDate, 'MMM d, yyyy')}
              </span>
            </div>
          </div>
        </div>

        {/* Visualization Section */}
        {reportData?.visualizationData && (
          <div className="mb-8">
            <ReportVisualization
              data={reportData.visualizationData}
              reportType={reportType}
              dateRange={dateRange}
            />
          </div>
        )}

        {error ? (
          <ErrorMessage
            message={error.message || "Failed to load reports"}
            onRetry={handleRefresh}
          />
        ) : isLoading ? (
          <LoadingSpinner className="h-64" />
        ) : reportData?.items?.length === 0 ? (
          <EmptyState
            title="No report data"
            description="Try adjusting your date range or filters"
            icon={<ChartBarIcon className="h-10 w-10 mx-auto text-gray-400" />}
          />
        ) : (
          <>
            <ReportsList
              reports={reportData.items}
              reportType={reportType}
            />

            {reportData?.pagination && (
              <div className="mt-6">
                <Pagination
                  currentPage={page}
                  totalPages={Math.ceil(reportData.pagination.total / pageSize)}
                  onPageChange={setPage}
                  pageSize={pageSize}
                  onPageSizeChange={setPageSize}
                />
              </div>
            )}
          </>
        )}
      </div>

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        dateRange={dateRange}
        reportType={reportType}
      />

      <ScheduleModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        reportType={reportType}
        dateRange={dateRange}
      />

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        reportId={reportData?.id}
      />

      <TemplateModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onApply={(template) => {
          setDateRange(template.dateRange);
          setReportType(template.reportType);
        }}
      />
    </div>
  );
}

async function fetchReports(dateRange, reportType, page, pageSize) {
  const params = {
    start_date: format(dateRange.startDate, 'yyyy-MM-dd'),
    end_date: format(dateRange.endDate, 'yyyy-MM-dd'),
    type: reportType,
    page,
    page_size: pageSize
  };
  const { data } = await axios.get('/api/reports', { params });
  return data;
}