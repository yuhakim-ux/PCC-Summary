import LightningModal from 'lightning/modal';

/**
 * Modal for editing/dismissing actions with optional notes.
 * Open via: AhisNotesModal.open({ label, message, size: 'small' })
 */
export default class AhisNotesModal extends LightningModal {
    notes = '';

    handleNotesChange(event) {
        this.notes = event.detail.value;
    }

    handleCancel() {
        this.close(null);
    }

    handleConfirm() {
        this.close({ confirmed: true, notes: this.notes });
    }
}
