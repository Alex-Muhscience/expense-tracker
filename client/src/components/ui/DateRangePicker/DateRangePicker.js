import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function DateRangePicker({ value, onChange, disabled }) {
  const [startDate, setStartDate] = useState(value?.startDate || null);
  const [endDate, setEndDate] = useState(value?.endDate || null);

  useEffect(() => {
    setStartDate(value?.startDate || null);
    setEndDate(value?.endDate || null);
  }, [value]);

  const handleStartDateChange = (date) => {
    const newStartDate = date;
    setStartDate(newStartDate);
    onChange({ startDate: newStartDate, endDate });
  };

  const handleEndDateChange = (date) => {
    const newEndDate = date;
    setEndDate(newEndDate);
    onChange({ startDate, endDate: newEndDate });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
      <DatePicker
        selected={startDate}
        onChange={handleStartDateChange}
        selectsStart
        startDate={startDate}
        endDate={endDate}
        disabled={disabled}
        className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholderText="Start Date"
        dateFormat="MM/dd/yyyy"
      />
      <DatePicker
        selected={endDate}
        onChange={handleEndDateChange}
        selectsEnd
        startDate={startDate}
        endDate={endDate}
        minDate={startDate}
        disabled={disabled}
        className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholderText="End Date"
        dateFormat="MM/dd/yyyy"
      />
    </div>
  );
}

DateRangePicker.propTypes = {
  value: PropTypes.shape({
    startDate: PropTypes.instanceOf(Date),
    endDate: PropTypes.instanceOf(Date),
  }),
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

DateRangePicker.defaultProps = {
  value: { startDate: null, endDate: null },
  disabled: false,
};