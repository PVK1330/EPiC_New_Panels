import { useState, useEffect } from 'react';
import { Clock, Edit, Trash2, Filter, Plus, ChevronDown } from 'lucide-react';
import { getCaseTimeline, addTimelineEntry, deleteTimelineEntry } from '../services/timelineService';

const ACTION_TYPES = [
  'case_created',
  'case_updated',
  'status_changed',
  'document_uploaded',
  'document_deleted',
  'note_added',
  'task_created',
  'task_completed',
  'payment_made',
  'caseworker_assigned',
  'caseworker_reassigned',
  'deadline_changed',
  'communication_sent',
  'interview_scheduled',
  'visa_submitted',
  'visa_approved',
  'visa_denied',
  'other',
];

const ACTION_TYPE_LABELS = {
  case_created: 'Case Created',
  case_updated: 'Case Updated',
  status_changed: 'Status Changed',
  document_uploaded: 'Document Uploaded',
  document_deleted: 'Document Deleted',
  note_added: 'Note Added',
  task_created: 'Task Created',
  task_completed: 'Task Completed',
  payment_made: 'Payment Made',
  caseworker_assigned: 'Caseworker Assigned',
  caseworker_reassigned: 'Caseworker Reassigned',
  deadline_changed: 'Deadline Changed',
  communication_sent: 'Communication Sent',
  interview_scheduled: 'Interview Scheduled',
  visa_submitted: 'Visa Submitted',
  visa_approved: 'Visa Approved',
  visa_denied: 'Visa Denied',
  other: 'Other',
};

const CaseTimeline = ({ caseId, currentUser }) => {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [newEntry, setNewEntry] = useState({
    actionType: 'other',
    description: '',
    visibility: 'public',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (caseId) {
      fetchTimeline();
    }
  }, [caseId]);

  const fetchTimeline = async () => {
    try {
      setLoading(true);
      const response = await getCaseTimeline(caseId);
      if (response?.data?.data) {
        setTimeline(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching timeline:', err);
      setError('Failed to load timeline');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async (e) => {
    e.preventDefault();
    if (!newEntry.description.trim()) {
      setError('Description is required');
      return;
    }

    try {
      await addTimelineEntry({
        caseId,
        actionType: newEntry.actionType,
        description: newEntry.description,
        performedBy: currentUser?.id,
        visibility: newEntry.visibility,
        isSystemAction: false,
      });
      setNewEntry({ actionType: 'other', description: '', visibility: 'public' });
      setShowAddForm(false);
      setError('');
      fetchTimeline();
    } catch (err) {
      console.error('Error adding timeline entry:', err);
      setError('Failed to add timeline entry');
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (!confirm('Are you sure you want to delete this timeline entry?')) return;
    
    try {
      await deleteTimelineEntry(entryId);
      fetchTimeline();
    } catch (err) {
      console.error('Error deleting timeline entry:', err);
      setError('Failed to delete timeline entry');
    }
  };

  const filteredTimeline = filterType === 'all' 
    ? timeline 
    : timeline.filter(item => item.actionType === filterType);

  const getActionIcon = (actionType) => {
    return <Clock size={14} className="text-secondary" />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      {/* Header with Add and Filter */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-secondary">Case Timeline</h3>
        <div className="flex gap-2">
          <div className="relative">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-black text-gray-600 hover:border-secondary/40 hover:text-secondary transition-colors"
            >
              <Filter size={14} />
              {filterType !== 'all' && (
                <span className="text-secondary">{ACTION_TYPE_LABELS[filterType]}</span>
              )}
              <ChevronDown size={14} />
            </button>
            {filterOpen && (
              <div className="absolute right-0 mt-1 w-48 border border-gray-200 rounded-xl bg-white shadow-xl z-10 max-h-64 overflow-y-auto">
                <button
                  onClick={() => { setFilterType('all'); setFilterOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-xs font-black hover:bg-gray-50 ${filterType === 'all' ? 'bg-secondary/5 text-secondary' : 'text-gray-700'}`}
                >
                  All Actions
                </button>
                {ACTION_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => { setFilterType(type); setFilterOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-xs font-black hover:bg-gray-50 ${filterType === type ? 'bg-secondary/5 text-secondary' : 'text-gray-700'}`}
                  >
                    {ACTION_TYPE_LABELS[type]}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-black text-white hover:bg-secondary/90 transition-colors"
          >
            <Plus size={14} />
            Add Entry
          </button>
        </div>
      </div>

      {/* Add Entry Form */}
      {showAddForm && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
          <h4 className="text-xs font-black text-gray-900">Add Timeline Entry</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                Action Type
              </label>
              <select
                value={newEntry.actionType}
                onChange={(e) => setNewEntry({ ...newEntry, actionType: e.target.value })}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-800 outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary"
              >
                {ACTION_TYPES.map(type => (
                  <option key={type} value={type}>{ACTION_TYPE_LABELS[type]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                Visibility
              </label>
              <select
                value={newEntry.visibility}
                onChange={(e) => setNewEntry({ ...newEntry, visibility: e.target.value })}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-800 outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary"
              >
                <option value="public">Public</option>
                <option value="internal">Internal</option>
                <option value="admin_only">Admin Only</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
              Description
            </label>
            <textarea
              value={newEntry.description}
              onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
              rows={2}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-800 outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary resize-none"
              placeholder="Describe what happened..."
            />
          </div>
          {error && (
            <p className="text-xs font-bold text-red-600">{error}</p>
          )}
          <div className="flex justify-end gap-2">
            <button
              onClick={() => { setShowAddForm(false); setError(''); }}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-black text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAddEntry}
              className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-black text-white hover:bg-secondary/90"
            >
              Add Entry
            </button>
          </div>
        </div>
      )}

      {/* Timeline List */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">Loading timeline...</p>
        </div>
      ) : filteredTimeline.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500 italic">
            {filterType === 'all' ? 'No timeline events recorded' : 'No events of this type'}
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredTimeline.map((item, index) => (
            <div key={item.id || index} className="flex gap-3 items-start group">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                  {getActionIcon(item.actionType)}
                </div>
                {index < filteredTimeline.length - 1 && (
                  <div className="w-0.5 h-full bg-gray-200 min-h-[40px]"></div>
                )}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-black text-gray-900">
                        {ACTION_TYPE_LABELS[item.actionType] || item.actionType?.replace(/_/g, ' ').toUpperCase()}
                      </p>
                      {item.isSystemAction && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-gray-100 text-[10px] font-black text-gray-500">
                          System
                        </span>
                      )}
                      {item.visibility === 'internal' && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-amber-50 text-[10px] font-black text-amber-700">
                          Internal
                        </span>
                      )}
                      {item.visibility === 'admin_only' && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-red-50 text-[10px] font-black text-red-700">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(item.actionDate)}</p>
                    <p className="text-sm text-gray-600 mt-2">{item.description}</p>
                    {item.performer && (
                      <p className="text-xs text-gray-400 mt-1">
                        by {item.performer.first_name} {item.performer.last_name}
                      </p>
                    )}
                  </div>
                  {!item.isSystemAction && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleDeleteEntry(item.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete entry"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CaseTimeline;
