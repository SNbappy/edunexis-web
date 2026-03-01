import Modal from './Modal'
import Button from './Button'
import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    description: string
    confirmLabel?: string
    cancelLabel?: string
    isLoading?: boolean
    variant?: 'danger' | 'warning'
}

export default function ConfirmDialog({
    isOpen, onClose, onConfirm, title, description,
    confirmLabel = 'Confirm', cancelLabel = 'Cancel',
    isLoading, variant = 'danger',
}: ConfirmDialogProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="sm">
            <div className="text-center space-y-4">
                <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center
          ${variant === 'danger' ? 'bg-destructive/10' : 'bg-warning/10'}`}>
                    <AlertTriangle className={`w-7 h-7 ${variant === 'danger' ? 'text-destructive' : 'text-warning'}`} />
                </div>
                <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </div>
                <div className="flex gap-3 pt-2">
                    <Button variant="secondary" className="flex-1" onClick={onClose} disabled={isLoading}>
                        {cancelLabel}
                    </Button>
                    <Button variant="danger" className="flex-1" onClick={onConfirm} loading={isLoading}>
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}
