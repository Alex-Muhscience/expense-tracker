import { useState, useEffect, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  LinkIcon,
  EyeIcon,
  PencilSquareIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { format, addDays } from 'date-fns';
import axios from '../../../services/api';
import Modal from '../../ui/Modal/Modal';
import Button from '../../ui/Button/Button';
import Input from '../../ui/Form/Input';
import Select from '../../ui/Form/Select';
import Toggle from '../../ui/Toggle/Toggle';
import DatePicker from '../../ui/DateRangePicker/DateRangePicker';
import { useToast } from '../../../context/ToastContext';
import LoadingSpinner from '../../shared/Loading/LoadingSpinner';
import CopyToClipboard from '../../shared/CopyToClipboard/CopyToClipboard';

const ACCESS_LEVELS = [
  { value: 'view', label: 'Can view', icon: <EyeIcon className="h-4 w-4" /> },
  { value: 'edit', label: 'Can edit', icon: <PencilSquareIcon className="h-4 w-4" /> }
];

const EXPIRATION_OPTIONS = [
  { value: '1d', label: '1 day' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: 'custom', label: 'Custom date' },
  { value: 'never', label: 'Never expire' }
];

export default function ShareModal({ isOpen, onClose, reportId }) {
  const { addToast } = useToast();
  const [shareLink, setShareLink] = useState('');
  const [isLinkGenerated, setIsLinkGenerated] = useState(false);
  const [accessLevel, setAccessLevel] = useState('view');
  const [expirationOption, setExpirationOption] = useState('7d');
  const [customExpiration, setCustomExpiration] = useState(addDays(new Date(), 7));
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [password, setPassword] = useState('');
  const [sharedLinks, setSharedLinks] = useState([]);

  const fetchSharedLinks = useCallback(async () => {
    try {
      const { data } = await axios.get(`/api/reports/${reportId}/share`);
      setSharedLinks(data.links);
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Failed to load shared links',
        message: error.response?.data?.message || 'Something went wrong'
      });
    }
  }, [reportId, addToast]);

  const { mutate: generateLink, isLoading: isGenerating } = useMutation(
    (data) => axios.post(`/api/reports/${reportId}/share`, data),
    {
      onSuccess: (response) => {
        setShareLink(response.data.link);
        setIsLinkGenerated(true);
        fetchSharedLinks();
        addToast({
          type: 'success',
          title: 'Share link created',
          message: 'The shareable link has been generated successfully.'
        });
      },
      onError: (error) => {
        addToast({
          type: 'error',
          title: 'Failed to generate link',
          message: error.response?.data?.message || 'Something went wrong'
        });
      }
    }
  );

  const { mutate: revokeLink, isLoading: isRevoking } = useMutation(
    (linkId) => axios.delete(`/api/reports/${reportId}/share/${linkId}`),
    {
      onSuccess: () => {
        fetchSharedLinks();
        addToast({
          type: 'success',
          title: 'Link revoked',
          message: 'The shareable link has been revoked successfully.'
        });
      },
      onError: (error) => {
        addToast({
          type: 'error',
          title: 'Failed to revoke link',
          message: error.response?.data?.message || 'Something went wrong'
        });
      }
    }
  );

  useEffect(() => {
    if (isOpen && reportId) {
      fetchSharedLinks();
      setIsLinkGenerated(false);
      setShareLink('');
    }
  }, [isOpen, reportId, fetchSharedLinks]);

  const handleGenerateLink = () => {
    let expirationDate = null;

    if (expirationOption === 'custom') {
      expirationDate = customExpiration;
    } else if (expirationOption !== 'never') {
      const days = parseInt(expirationOption);
      expirationDate = addDays(new Date(), days);
    }

    generateLink({
      accessLevel,
      expirationDate: expirationDate ? format(expirationDate, 'yyyy-MM-dd') : null,
      password: isPasswordProtected ? password : null
    });
  };

  const handleRevokeLink = (linkId) => {
    revokeLink(linkId);
  };

  const getExpirationText = (link) => {
    if (!link.expirationDate) return 'Never expires';
    const expiresInDays = Math.ceil((new Date(link.expirationDate) - new Date()) / (1000 * 60 * 60 * 24));

    if (expiresInDays <= 0) return 'Expired';
    if (expiresInDays < 1) return 'Expires today';
    if (expiresInDays === 1) return 'Expires tomorrow';
    return `Expires in ${Math.floor(expiresInDays)} days`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share Report"
      size="lg"
    >
      <div className="space-y-6">
        {!isLinkGenerated ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Access Level
                </label>
                <Select
                  options={ACCESS_LEVELS}
                  value={accessLevel}
                  onChange={setAccessLevel}
                  optionIcon={true}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Link Expiration
                </label>
                <Select
                  options={EXPIRATION_OPTIONS}
                  value={expirationOption}
                  onChange={setExpirationOption}
                />
              </div>
            </div>

            {expirationOption === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Expiration Date
                </label>
                <DatePicker
                  selected={customExpiration}
                  onChange={setCustomExpiration}
                  minDate={new Date()}
                />
              </div>
            )}

            <div className="pt-2">
              <Toggle
                label="Password Protection"
                enabled={isPasswordProtected}
                onChange={setIsPasswordProtected}
              />
              {isPasswordProtected && (
                <div className="mt-2">
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    aria-label="Password for protected link"
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <LinkIcon className="h-5 w-5 text-blue-500" />
              <div className="flex-1 truncate text-sm font-medium">
                {shareLink}
              </div>
              <CopyToClipboard text={shareLink} />
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>Anyone with this link can {accessLevel === 'view' ? 'view' : 'edit'} this report.</p>
              {expirationOption !== 'never' && (
                <p className="flex items-center mt-1">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  {expirationOption === 'custom'
                    ? `Expires on ${format(customExpiration, 'MMM d, yyyy')}`
                    : `Expires in ${expirationOption.replace('d', '')} days`}
                </p>
              )}
            </div>
          </div>
        )}

        {sharedLinks.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Active Share Links
            </h3>
            <div className="space-y-2">
              {sharedLinks.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">
                        {link.accessLevel === 'view' ? (
                          <EyeIcon className="h-4 w-4 text-gray-500" />
                        ) : (
                          <PencilSquareIcon className="h-4 w-4 text-gray-500" />
                        )}
                      </span>
                      <span className="text-sm truncate">
                        {link.accessLevel === 'view' ? 'View access' : 'Edit access'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {getExpirationText(link)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRevokeLink(link.id)}
                    disabled={isRevoking}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                    aria-label={`Revoke ${link.accessLevel} access link`}
                  >
                    {isRevoking ? 'Revoking...' : 'Revoke'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          {!isLinkGenerated ? (
            <Button
              onClick={handleGenerateLink}
              disabled={isGenerating || (isPasswordProtected && !password)}
              aria-label="Generate share link"
            >
              {isGenerating ? (
                <>
                  <LoadingSpinner className="h-4 w-4 mr-2" />
                  Generating...
                </>
              ) : (
                'Generate Link'
              )}
            </Button>
          ) : (
            <Button
              onClick={() => setIsLinkGenerated(false)}
              aria-label="Create another share link"
            >
              Create Another Link
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}