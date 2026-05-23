import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Bell } from "lucide-react";
import NotificationList from "../../components/notifications/NotificationList";
import { fetchUnreadCount } from "../../store/slices/notificationSlice";

export default function CaseworkerNotifications() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUnreadCount());
  }, [dispatch]);

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-black text-secondary tracking-tight flex items-center gap-3">
          <Bell className="text-primary" size={32} />
          Notifications
        </h1>
        <p className="text-sm font-bold text-gray-500 mt-1">
          Your alerts, case updates, and assigned tasks
        </p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <NotificationList showUnreadOnly={false} />
      </div>
    </div>
  );
}
