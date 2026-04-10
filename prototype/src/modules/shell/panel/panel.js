import { LightningElement, api, track } from 'lwc';

export default class Panel extends LightningElement {
    @api selectedPanel = 'agentforce_panel';
    @track isPinned = false;

    get showAgentforcePanel() {
        return this.selectedPanel === 'agentforce_panel';
    }

    get showTrailheadPanel() {
        return this.selectedPanel === 'trailhead_panel';
    }

    get showNotificationPanel() {
        return this.selectedPanel === 'notification_panel';
    }

    get showSettingsPanel() {
        return this.selectedPanel === 'settings_panel';
    }

    get panelTitle() {
        const titles = {
            'agentforce_panel': 'Agentforce',
            'trailhead_panel': 'Guidance Center',
            'notification_panel': 'Notifications',
            'settings_panel': 'Setup'
        };
        return titles[this.selectedPanel] || 'Panel Header';
    }

    get notificationItems() {
        return [
            { id: 'n1', icon: 'utility:warning', title: 'Appeal SLA expiring', body: 'Knee claim appeal SLA expires in 3 days.', time: '10 min ago', isUnread: true },
            { id: 'n2', icon: 'utility:clock', title: 'Prior Auth update', body: 'Insulin PA-992 moved to clinical review.', time: '1 hr ago', isUnread: true },
            { id: 'n3', icon: 'utility:check', title: 'Case assigned', body: 'Case CS-1234 assigned to you.', time: '3 hrs ago', isUnread: false },
        ];
    }

    get guidanceItems() {
        return [
            { id: 'g1', title: 'Console Navigation', body: 'Learn to manage workspace tabs and subtabs for multi-record workflows.' },
            { id: 'g2', title: 'Using Agentforce', body: 'Ask Agentforce to summarize records, draft emails, or look up policy details.' },
            { id: 'g3', title: 'Keyboard Shortcuts', body: 'Press Ctrl+/ to see all available keyboard shortcuts in the console.' },
        ];
    }

    get unreadCount() {
        return this.notificationItems.filter((n) => n.isUnread).length;
    }

    get hasUnread() {
        return this.unreadCount > 0;
    }

    get pinIconName() {
        return this.isPinned ? 'utility:pinned' : 'utility:pin';
    }

    get pinLabel() {
        return this.isPinned ? 'Unpin Panel' : 'Pin Panel';
    }

    handleTogglePin() {
        this.isPinned = !this.isPinned;
    }

    handleClosePanel() {
        this.dispatchEvent(new CustomEvent('panelclose', {
            bubbles: true,
            composed: true
        }));
    }
}