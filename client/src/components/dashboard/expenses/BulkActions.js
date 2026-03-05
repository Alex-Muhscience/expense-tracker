import PropTypes from 'prop-types';
import Button from '../../ui/Button/Button';
import { TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function BulkActions({ count, onDelete, onCancel, loading }) {
  return (
    <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 mb-6 flex items-center justify-between">
      <div className="text-blue-800 dark:text-blue-200 font-medium">
        {count} {count === 1 ? 'expense' : 'expenses'} selected
      </div>
      <div className="flex gap-2">
        <Button
          variant="danger"
          onClick={onDelete}
          loading={loading}
          icon={<TrashIcon className="h-4 w-4 mr-2" />}
          size="sm"
        >
          Delete
        </Button>
        <Button
          variant="text"
          onClick={onCancel}
          icon={<XMarkIcon className="h-4 w-4 mr-2" />}
          size="sm"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

BulkActions.propTypes = {
  count: PropTypes.number.isRequired,
  onDelete: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};