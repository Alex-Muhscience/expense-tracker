import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  DocumentIcon,
  StarIcon,
  ArrowPathIcon,
  TrashIcon, PencilSquareIcon
} from '@heroicons/react/24/outline';
import axios from '../../../services/api';
import Modal from '../../ui/Modal/Modal';
import Button from '../../ui/Button/Button';
import Input from '../../ui/Form/Input';
import EmptyState from '../../shared/EmptyState/EmptyState';
import { useToast } from '../../../context/ToastContext';
import LoadingSpinner from '../../shared/Loading/LoadingSpinner';
import { format } from 'date-fns';

export default function TemplateModal({ isOpen, onClose, onApply }) {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [templateName, setTemplateName] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentTemplateId, setCurrentTemplateId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    data: templates,
    isLoading,
    error,
    refetch
  } = useQuery(['report-templates'], () =>
    axios.get('/api/reports/templates').then((res) => res.data)
  );

  const { mutate: saveTemplate, isLoading: isSaving } = useMutation(
    (data) => {
      const url = editMode
        ? `/api/reports/templates/${currentTemplateId}`
        : '/api/reports/templates';
      const method = editMode ? 'put' : 'post';
      return axios[method](url, data);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['report-templates']);
        resetForm();
        addToast({
          type: 'success',
          title: editMode ? 'Template updated' : 'Template saved',
          message: `Template has been ${editMode ? 'updated' : 'saved'} successfully.`
        });
      },
      onError: (error) => {
        addToast({
          type: 'error',
          title: 'Error',
          message: error.response?.data?.message || 'Something went wrong'
        });
      }
    }
  );

  const { mutate: deleteTemplate, isLoading: isDeleting } = useMutation(
    (id) => axios.delete(`/api/reports/templates/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['report-templates']);
        addToast({
          type: 'success',
          title: 'Template deleted',
          message: 'Template has been deleted successfully.'
        });
      },
      onError: (error) => {
        addToast({
          type: 'error',
          title: 'Error',
          message: error.response?.data?.message || 'Something went wrong'
        });
      }
    }
  );

  const { mutate: setDefaultTemplate, isLoading: isSettingDefault } = useMutation(
    (id) => axios.put(`/api/reports/templates/${id}/set-default`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['report-templates']);
        addToast({
          type: 'success',
          title: 'Default template set',
          message: 'Default template has been updated successfully.'
        });
      },
      onError: (error) => {
        addToast({
          type: 'error',
          title: 'Error',
          message: error.response?.data?.message || 'Something went wrong'
        });
      }
    }
  );

  useEffect(() => {
    if (isOpen) {
      refetch();
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setTemplateName('');
    setIsDefault(false);
    setEditMode(false);
    setCurrentTemplateId(null);
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Template name is required'
      });
      return;
    }

    saveTemplate({
      name: templateName,
      isDefault,
      config: {
        // In a real app, this would include the current report configuration
        reportType: 'expenses',
        dateRange: {
          startDate: format(new Date(), 'yyyy-MM-dd'),
          endDate: format(new Date(), 'yyyy-MM-dd')
        },
        filters: {},
        visualizationOptions: {}
      }
    });
  };

  const handleEditTemplate = (template) => {
    setTemplateName(template.name);
    setIsDefault(template.isDefault);
    setEditMode(true);
    setCurrentTemplateId(template.id);
  };

  const handleApplyTemplate = (template) => {
    onApply({
      reportType: template.config.reportType,
      dateRange: {
        startDate: new Date(template.config.dateRange.startDate),
        endDate: new Date(template.config.dateRange.endDate)
      }
    });
    onClose();
  };

  const filteredTemplates = templates?.filter((template) =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Report Templates"
      size="lg"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {editMode ? 'Edit Template' : 'Save Current Configuration'}
            </h3>
            <Input
              label="Template Name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g. Monthly Expense Report"
            />
            <div className="flex items-center justify-between pt-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Set as default template
              </label>
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
            <div className="pt-2">
              <Button
                onClick={handleSaveTemplate}
                disabled={isSaving || !templateName.trim()}
                fullWidth
              >
                {isSaving ? (
                  <>
                    <LoadingSpinner className="h-4 w-4 mr-2" />
                    {editMode ? 'Updating...' : 'Saving...'}
                  </>
                ) : editMode ? (
                  'Update Template'
                ) : (
                  'Save as Template'
                )}
              </Button>
              {editMode && (
                <Button
                  variant="secondary"
                  onClick={resetForm}
                  fullWidth
                  className="mt-2"
                >
                  Cancel Edit
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Saved Templates
              </h3>
              <div className="relative w-48">
                <Input
                  type="search"
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size="sm"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner className="h-8 w-8" />
              </div>
            ) : error ? (
              <div className="py-8 text-center text-red-500">
                Failed to load templates.{' '}
                <button
                  onClick={refetch}
                  className="text-blue-500 hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : filteredTemplates?.length === 0 ? (
              <EmptyState
                title="No templates found"
                description={searchTerm ? 'Try a different search term' : 'Save your first template to get started'}
                icon={<DocumentIcon className="h-10 w-10 mx-auto text-gray-400" />}
              />
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredTemplates?.map((template) => (
                  <div
                    key={template.id}
                    className="group flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="flex items-center min-w-0">
                      {template.isDefault && (
                        <StarIcon className="h-4 w-4 text-yellow-500 mr-2 flex-shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {template.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {template.config.reportType} • {format(new Date(template.createdAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleApplyTemplate(template)}
                        className="text-blue-500 hover:text-blue-700 p-1"
                        title="Apply template"
                      >
                        <ArrowPathIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditTemplate(template)}
                        className="text-gray-500 hover:text-gray-700 p-1"
                        title="Edit template"
                      >
                        <PencilSquareIcon className="h-4 w-4" />
                      </button>
                      {!template.isDefault && (
                        <button
                          onClick={() => setDefaultTemplate(template.id)}
                          className="text-gray-500 hover:text-yellow-500 p-1"
                          title="Set as default"
                          disabled={isSettingDefault}
                        >
                          <StarIcon className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteTemplate(template.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Delete template"
                        disabled={isDeleting}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}