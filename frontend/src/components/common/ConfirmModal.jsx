import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import styles from '../../styles/components/ConfirmModal.module.css'

export default function ConfirmModal({
  open,
  title = 'Are you sure?',
  message = 'Please confirm your action.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  tone = 'danger'
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onCancel?.()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!open) return null

  const modal = (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
        </div>
        <div className={styles.body}>
          <p className={styles.message}>{message}</p>
        </div>
        <div className={styles.footer}>
          <button className={`${styles.btn} ${styles.cancel}`} onClick={onCancel}>{cancelText}</button>
          <button className={`${styles.btn} ${tone === 'danger' ? styles.danger : styles.primary}`} onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}
