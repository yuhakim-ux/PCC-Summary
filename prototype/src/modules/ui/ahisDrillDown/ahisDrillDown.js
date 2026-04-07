import LightningModal from 'lightning/modal';
import { getDrillDownRecords } from 'data/ahis';

const FIELD_LABELS = {
    status: 'Status',
    priority: 'Priority',
    dueDate: 'Due Date',
    ownerName: 'Assigned To',
    startTime: 'Start Time',
    location: 'Location',
    workType: 'Type',
    caseNumber: 'Case #',
};

const DRILL_CONFIG = {
    Clinical: { fields: ['status', 'dueDate', 'priority', 'ownerName'] },
    Social: { fields: ['status', 'dueDate', 'priority', 'ownerName'] },
    Operational: { fields: ['status', 'startTime', 'workType', 'location'] },
    Compliance: { fields: ['caseNumber', 'status', 'priority', 'ownerName'] },
};

const STATUS_CLASSES = {
    Open: 'status-badge-open',
    Overdue: 'status-badge-overdue',
    'In Progress': 'status-badge-progress',
    'Not Started': 'status-badge-neutral',
    Scheduled: 'status-badge-scheduled',
    Working: 'status-badge-progress',
    New: 'status-badge-open',
};

/**
 * Drill-down modal for viewing related records by risk category.
 * Open via: AhisDrillDown.open({ label, drillDownType, drillDownTitle, size })
 */
export default class AhisDrillDown extends LightningModal {
    records = [];
    isLoading = true;

    connectedCallback() {
        super.connectedCallback?.();
        this.loadRecords();
    }

    loadRecords() {
        this.isLoading = true;
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        setTimeout(() => {
            this.records = getDrillDownRecords(this.drillDownType);
            this.isLoading = false;
        }, 500);
    }

    get showEmpty() {
        return !this.isLoading && this.records.length === 0;
    }

    get hasRecords() {
        return !this.isLoading && this.records.length > 0;
    }

    get recordCount() {
        return this.records.length;
    }

    get formattedRecords() {
        const config = DRILL_CONFIG[this.drillDownType] || DRILL_CONFIG.Clinical;
        return this.records.map((record) => {
            const displayName = record.name || record.subject || record.caseNumber || 'Record';
            const fields = config.fields
                .filter((f) => record[f] !== undefined && record[f] !== null)
                .map((f, i) => {
                    const isStatus = f === 'status';
                    const value = this.formatValue(f, record[f]);
                    return {
                        key: `${record.id}-${f}-${i}`,
                        label: FIELD_LABELS[f] || f,
                        value,
                        isStatus,
                        isText: !isStatus,
                        statusClass: isStatus ? (STATUS_CLASSES[record[f]] || 'status-badge-neutral') : '',
                    };
                });
            return { ...record, displayName, fields };
        });
    }

    formatValue(field, value) {
        if (value == null) return '-';
        if (field === 'dueDate' || field === 'startTime') {
            try {
                const d = new Date(value);
                return field === 'startTime' ? d.toLocaleString() : d.toLocaleDateString();
            } catch (_) {
                return value;
            }
        }
        return String(value);
    }

    handleClose() {
        this.close();
    }
}
