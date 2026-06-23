import { useTranslation } from 'react-i18next';
import ConfirmDialog from './ConfirmDialog';

export interface DeleteItem {
  id: number;
  name?: string;
  title?: string;
  filename?: string;
  [key: string]: any;
}

export interface DeleteConfirmDialogProps {
  open: boolean;
  item: DeleteItem | null;
  itemType: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  customMessage?: React.ReactNode;
}

export default function DeleteConfirmDialog({
  open,
  item,
  itemType,
  loading = false,
  onConfirm,
  onCancel,
  customMessage,
}: DeleteConfirmDialogProps) {
  const { t } = useTranslation();

  const getItemName = () => {
    if (!item) return '';
    return item.name || item.title || item.filename || item.sessionId || (item.id ? `ID: ${item.id}` : '');
  };

  const defaultMessage = item
    ? t('common.confirm_delete_message', { itemType, itemName: getItemName() })
    : '';

  return (
    <ConfirmDialog
      open={open}
      title={t('common.confirm_delete_dialog_title', { itemType })}
      message={customMessage || defaultMessage}
      confirmText={t('common.confirm_delete')}
      cancelText={t('common.cancel')}
      confirmVariant="danger"
      loading={loading}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}

