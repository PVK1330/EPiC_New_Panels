import { useState } from 'react';
import { createTeamsMeeting } from '../services/teamsApi';
import Button from './Button';
import Input from './Input';
import Modal from './Modal';
import { Calendar, Clock, Users, Video } from 'lucide-react';

const CreateMeetingModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    subject: '',
    description: '',
    start_time: '',
    end_time: '',
    attendees: '',
    meeting_type: 'online',
    reminder_minutes: 15,
    related_case_id: ''
  });

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Parse attendees if provided
      let attendees = [];
      if (form.attendees) {
        attendees = form.attendees.split(',').map(email => ({
          email: email.trim(),
          type: 'required'
        })).filter(a => a.email);
      }

      const meetingData = {
        subject: form.subject,
        description: form.description,
        start_time: form.start_time,
        end_time: form.end_time,
        attendees: attendees.length > 0 ? attendees : undefined,
        meeting_type: form.meeting_type,
        reminder_minutes: parseInt(form.reminder_minutes),
        related_case_id: form.related_case_id || undefined
      };

      const response = await createTeamsMeeting(meetingData);
      
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      onClose();
      
      // Reset form
      setForm({
        subject: '',
        description: '',
        start_time: '',
        end_time: '',
        attendees: '',
        meeting_type: 'online',
        reminder_minutes: 15,
        related_case_id: ''
      });
      
    } catch (error) {
      console.error('Failed to create meeting:', error);
      alert('Failed to create meeting. Please make sure you are connected to Microsoft Teams.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Video className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Create Teams Meeting</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Meeting Subject"
            name="subject"
            value={form.subject}
            onChange={handleChange}
            placeholder="Enter meeting subject"
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4" />
                Start Time
              </label>
              <input
                type="datetime-local"
                name="start_time"
                value={form.start_time}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Clock className="w-4 h-4" />
                End Time
              </label>
              <input
                type="datetime-local"
                name="end_time"
                value={form.end_time}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Users className="w-4 h-4" />
              Attendees (comma-separated emails)
            </label>
            <textarea
              name="attendees"
              value={form.attendees}
              onChange={handleChange}
              placeholder="email1@example.com, email2@example.com"
              rows={2}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
            />
          </div>

          <Input
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Enter meeting description (optional)"
            as="textarea"
            rows={3}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Meeting Type
              </label>
              <select
                name="meeting_type"
                value={form.meeting_type}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="online">Online</option>
                <option value="in-person">In-Person</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Reminder (minutes before)
              </label>
              <input
                type="number"
                name="reminder_minutes"
                value={form.reminder_minutes}
                onChange={handleChange}
                min="0"
                max="1440"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <Input
            label="Related Case ID (optional)"
            name="related_case_id"
            value={form.related_case_id}
            onChange={handleChange}
            placeholder="Enter case ID if applicable"
            type="number"
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Creating...' : 'Create Meeting'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CreateMeetingModal;
