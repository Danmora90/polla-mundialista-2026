import { useState, useEffect } from 'react';
import { dbService } from '../services/db';
import type { AppNotification } from '../types';

export const useNotifications = (userId: string | undefined) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const unsubscribe = dbService.subscribeNotifications(userId, (list) => {
        setNotifications(list);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err: any) {
      console.error('Error subscribing to notifications:', err);
      setError(err.message || 'Error al subscribirse a notificaciones.');
      setLoading(false);
    }
  }, [userId]);

  const pendingNotifications = notifications.filter(n => n.status === 'pending');
  const pendingCount = pendingNotifications.length;

  const acceptInvitation = async (notificationId: string) => {
    try {
      await dbService.respondToNotification(notificationId, true);
    } catch (err: any) {
      console.error('Error accepting invitation:', err);
      throw new Error(err.message || 'Error al aceptar la invitación.');
    }
  };

  const rejectInvitation = async (notificationId: string) => {
    try {
      await dbService.respondToNotification(notificationId, false);
    } catch (err: any) {
      console.error('Error rejecting invitation:', err);
      throw new Error(err.message || 'Error al rechazar la invitación.');
    }
  };

  return {
    notifications,
    pendingNotifications,
    pendingCount,
    loading,
    error,
    acceptInvitation,
    rejectInvitation,
  };
};
