import PropTypes from 'prop-types';
import { useState } from 'react';
import Modal from '../../ui/Modal/Modal';
import Button from '../../ui/Button/Button';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Input from '../../ui/Form/Input';
import Select from '../../ui/Form/Select';
import axios from '../../../services/api';

const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' }
];

export default function ScheduleModal({ isOpen, onClose, reportType, dateRange }) {
  const [frequency, setFrequency] = useState('weekly');
  const [email, setEmail] = useState('');
  const [time, setTime] = useState('09:00');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!email) {
      return setError('Email is required');
    }

    setIsSaving(true);
    setError('');

    try {
      await axios.post('/api/reports/schedules', {
        report_type: reportType,
        start_date: dateRange.startDate,
        end_date: dateRange.endDate,
        frequency,
        delivery_time: time,
        recipient_email: email
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to schedule report');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Schedule Report">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Frequency
            </label>
            <Select
              options={FREQUENCIES}
              value={frequency}
              onChange={setFrequency}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Delivery Time
            </label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Recipient Email
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
          />
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
            onClick={handleSubmit}
            disabled={isSaving}
            icon={<CheckIcon className="h-5 w-5 mr-2" />}
          >
            {isSaving ? 'Saving...' : 'Schedule'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

ScheduleModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  reportType: PropTypes.string.isRequired,
  dateRange: PropTypes.shape({
    startDate: PropTypes.instanceOf(Date),
    endDate: PropTypes.instanceOf(Date)
  }).isRequired
};