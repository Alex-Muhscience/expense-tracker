import PropTypes from 'prop-types';
import { useState } from 'react';
import Button from '../../ui/Button/Button';
import Modal from '../../ui/Modal/Modal';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import axios from '../../../services/api';

const FORMATS = [
  { id: 'csv', name: 'CSV' },
  { id: 'pdf', name: 'PDF' },
  { id: 'excel', name: 'Excel' }
];

export default function ExportModal({ isOpen, onClose, dateRange, reportType }) {
  const [format, setFormat] = useState('csv');
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState('');

  const handleExport = async () => {
    setIsExporting(true);
    setError('');

    try {
      const response = await axios.get('/api/reports/export', {
        params: {
          start_date: format(dateRange.startDate, 'yyyy-MM-dd'),
          end_date: format(dateRange.endDate, 'yyyy-MM-dd'),
          type: reportType,
          format
        },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}_report_${format(dateRange.startDate, 'yyyyMMdd')}_to_${format(dateRange.endDate, 'yyyyMMdd')}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to export report');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Report">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Export Format
          </label>
          <div className="grid grid-cols-3 gap-2">
            {FORMATS.map((fmt) => (
              <button
                key={fmt.id}
                onClick={() => setFormat(fmt.id)}
                className={`px-4 py-2 border rounded-md text-sm font-medium ${
                  format === fmt.id
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {fmt.name}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            variant="secondary"
            onClick={onClose}
            icon={<XMarkIcon className="h-5 w-5 mr-2" />}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            icon={<CheckIcon className="h-5 w-5 mr-2" />}
          >
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

ExportModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  dateRange: PropTypes.shape({
    startDate: PropTypes.instanceOf(Date),
    endDate: PropTypes.instanceOf(Date)
  }).isRequired,
  reportType: PropTypes.string.isRequired
};