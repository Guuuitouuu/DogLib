export type EducatorNotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string;
  bookingId: string | null;
  readAt: string | null;
  createdAt: string;
};

export type EducatorNotificationsSnapshot = {
  unreadCount: number;
  items: EducatorNotificationItem[];
};
