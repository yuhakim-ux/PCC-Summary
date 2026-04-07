/**
 * Section Registry — maps every section ID to its rendering config and
 * data-selector function. This single module replaces the ~400 lines of
 * per-section computed properties previously in ahisSummary.js.
 *
 * Each entry provides:
 *   component  — which primitive to render
 *   title      — accordion header text (null → no accordion, render bare)
 *   icon       — SLDS icon name for the header
 *   iconClass  — optional CSS class override for the icon
 *   personas   — which personas include this section
 *   dataSelector(ahisData) — returns the normalized data array for the primitive
 */

const STATUS_CLASS_MAP = {
    Denied: 'badge-error',
    Overdue: 'badge-error',
    Expired: 'badge-error',
    Expiring: 'badge-warning',
    Pending: 'badge-warning',
    'Pending approval': 'badge-warning',
    'Under Review': 'badge-warning',
    'Under Investigation': 'badge-warning',
    Approved: 'badge-success',
    Paid: 'badge-success',
    Active: 'badge-success',
    Accredited: 'badge-success',
    Complete: 'badge-success',
    Open: 'badge-info',
    Closed: 'badge-error',
    'Not Started': 'badge-neutral',
    New: 'badge-info',
};

function statusBadgeClass(status) {
    return STATUS_CLASS_MAP[status] || 'badge-neutral';
}

function severityBadgeClass(severity) {
    const s = (severity || '').toLowerCase();
    if (s === 'high' || s === 'severe') return 'badge-error';
    if (s === 'moderate') return 'badge-warning';
    return 'badge-neutral';
}

/* ══════════════════════════════════════
   MEMBER DATA SELECTORS
   ══════════════════════════════════════ */

function buildMemberIdentity(ip) {
    if (!ip) return [];
    return [
        { key: 'mid', label: 'Member ID', value: ip.memberId },
        { key: 'name', label: 'Name', value: ip.name },
        { key: 'dob', label: 'DOB', value: ip.dob },
        { key: 'gender', label: 'Gender / Language', value: `${ip.gender} · ${ip.language}` },
        {
            key: 'plan',
            label: 'Plan',
            value: ip.planName,
            statusValue: ip.planStatus,
            statusClass:
                ip.planStatusIndicator === 'green'
                    ? 'badge-success'
                    : ip.planStatusIndicator === 'yellow'
                      ? 'badge-warning'
                      : 'badge-error',
        },
        { key: 'eff', label: 'Effective Dates', value: ip.effectiveDates },
        { key: 'pcp', label: 'PCP', value: ip.pcp },
        { key: 'grp', label: 'Group #', value: ip.groupNumber },
    ].filter((r) => r.value);
}

function mapAlerts(alerts) {
    return (alerts || []).map((a, i) => ({
        key: `alert-${i}`,
        text: a.text,
        level: a.level,
    }));
}

function mapMemberConditions(conditions) {
    return (conditions || []).map((c, i) => ({
        key: `mc-${i}`,
        primary: c.name,
        badge: c.severity,
        badgeClass: severityBadgeClass(c.severity),
        isDetail: false,
        computedClass: 'bullet-item',
    }));
}

function mapMemberClaims(claims) {
    return (claims || []).map((c, i) => ({
        key: `clm-${i}`,
        primary: c.service,
        secondary: c.claimId,
        badge: c.status,
        badgeClass: statusBadgeClass(c.status),
        metaItems: [
            { key: `clm-${i}-billed`, text: `Billed: ${c.billedAmount}` },
            { key: `clm-${i}-resp`, text: `Resp: ${c.patientResponsibility}` },
        ],
        note: c.appealStatus ? `\u26A0 ${c.appealStatus}` : null,
        isDetail: true,
        hasMetaLine: true,
        computedClass: 'detail-item',
    }));
}

function mapMemberPriorAuths(paData) {
    if (!paData) return null;
    const subSections = [];
    if (paData.priorAuths?.length > 0) {
        subSections.push({
            key: 'sub-pa',
            label: 'Prior Authorizations',
            items: paData.priorAuths.map((pa, i) => ({
                key: `pa-${i}`,
                primary: pa.service,
                secondary: pa.authId,
                badge: pa.status,
                badgeClass: statusBadgeClass(pa.status),
                isDetail: false,
                computedClass: 'bullet-item',
            })),
        });
    }
    if (paData.appeals?.length > 0) {
        subSections.push({
            key: 'sub-appeals',
            label: 'Appeals',
            items: paData.appeals.map((a, i) => ({
                key: `apl-${i}`,
                primary: a.description,
                secondary: a.appealId,
                badge: `SLA: ${a.slaDaysRemaining} days`,
                badgeClass: 'badge-error',
                isDetail: false,
                computedClass: 'bullet-item',
            })),
        });
    }
    return subSections.length > 0 ? subSections : null;
}

function mapMemberOpenCases(cases) {
    return (cases || []).map((c, i) => ({
        key: `oc-${i}`,
        primary: c.subject,
        secondary: c.caseNumber,
        badge: c.status,
        badgeClass: statusBadgeClass(c.status),
        isDetail: false,
        computedClass: 'bullet-item',
    }));
}

function mapMemberCareGaps(careGaps) {
    if (!careGaps) return [];
    const items = [];
    (careGaps.gaps || []).forEach((g, i) => {
        items.push({ key: `gap-${i}`, text: g, level: 'warning' });
    });
    (careGaps.barriers || []).forEach((b, i) => {
        items.push({ key: `barrier-${i}`, text: b, level: 'info' });
    });
    return items;
}

/* ══════════════════════════════════════
   PATIENT DATA SELECTORS
   ══════════════════════════════════════ */

function buildPatientIdentity(id) {
    if (!id) return [];
    const lc = id.lastContact;
    const lastContactStr = lc ? `${lc.daysAgo}d ago via ${lc.channel} (${lc.topic})` : '';
    return [
        { key: 'name', label: 'Name', value: id.name },
        { key: 'age', label: 'Age / Gender', value: `${id.age}yo · ${id.gender}` },
        { key: 'lang', label: 'Language', value: id.language },
        { key: 'mrn', label: 'MRN', value: id.mrn },
        { key: 'pcp', label: 'PCP', value: id.pcp },
        { key: 'coord', label: 'Care Coordinator', value: id.careCoordinator },
        { key: 'lc', label: 'Last Contact', value: lastContactStr },
        {
            key: 'risk',
            label: 'Risk Level',
            value: id.riskLevel,
            statusValue: id.riskLevel,
            statusClass: (id.riskLevel || '').toLowerCase().includes('high') ? 'badge-error' : 'badge-warning',
        },
    ].filter((r) => r.value);
}

function mapPatientConditions(snapshot) {
    return (snapshot || []).map((c, i) => ({
        key: `cond-${i}`,
        primary: c.name,
        secondary: [c.stage, c.onsetDate ? `onset ${c.onsetDate}` : ''].filter(Boolean).join(' · ') || undefined,
        badge: c.severity,
        badgeClass: severityBadgeClass(c.severity),
        isDetail: false,
        computedClass: 'bullet-item',
    }));
}

function mapPatientMedications(meds) {
    return (meds || []).map((m, i) => ({
        key: `med-${i}`,
        primary: m.name,
        secondary: [m.dose, m.frequency].filter(Boolean).join(' — '),
        badge: m.refillAlert || null,
        badgeClass: 'badge-warning',
        metaItems: m.prescriber ? [{ key: `med-${i}-presc`, text: m.prescriber }] : [],
        note: m.sideEffects || null,
        isDetail: true,
        hasMetaLine: !!(m.refillAlert || m.prescriber),
        computedClass: 'detail-item',
    }));
}

function mapPatientActivity(activity) {
    if (!activity) return null;
    const subSections = [];

    if (activity.encounters?.length > 0) {
        subSections.push({
            key: 'sub-encounters',
            label: 'Encounters',
            items: activity.encounters.map((enc) => ({
                key: enc.date,
                primary: enc.type,
                secondary: `${enc.reason} — ${enc.date}` + (enc.provider ? ` · ${enc.provider}` : ''),
                isDetail: false,
                computedClass: 'bullet-item',
            })),
        });
    }
    if (activity.scheduledProcedures?.length > 0) {
        subSections.push({
            key: 'sub-procedures',
            label: 'Scheduled Procedures',
            items: activity.scheduledProcedures.map((p, i) => ({
                key: `proc-${i}`,
                primary: p.name,
                secondary: p.date,
                badge: p.status,
                badgeClass: statusBadgeClass(p.status),
                isDetail: false,
                computedClass: 'bullet-item',
            })),
        });
    }
    if (activity.pendingLabs?.length > 0) {
        subSections.push({
            key: 'sub-labs',
            label: 'Pending Labs',
            items: activity.pendingLabs.map((l, i) => ({
                key: `lab-${i}`,
                primary: l.name,
                secondary: `Ordered: ${l.orderedDate}`,
                badge: l.status,
                badgeClass: statusBadgeClass(l.status),
                isDetail: false,
                computedClass: 'bullet-item',
            })),
        });
    }
    if (activity.immunizations?.length > 0) {
        subSections.push({
            key: 'sub-immunizations',
            label: 'Immunizations',
            items: activity.immunizations.map((imm, i) => {
                const cls = imm.status === 'Current' ? 'badge-success' : imm.status === 'Overdue' ? 'badge-error' : 'badge-warning';
                return {
                    key: `imm-${i}`,
                    primary: imm.name,
                    badge: imm.status,
                    badgeClass: cls,
                    isDetail: false,
                    computedClass: 'bullet-item',
                };
            }),
        });
    }

    return subSections.length > 0 ? subSections : null;
}

function mapPatientReferrals(referrals) {
    return (referrals || []).map((r, i) => ({
        key: `ref-${i}`,
        primary: r.specialty,
        secondary: `from ${r.referringProvider} · ${r.date}`,
        badge: r.status,
        badgeClass: statusBadgeClass(r.status),
        isDetail: false,
        computedClass: 'bullet-item',
    }));
}

function mapPatientCareGaps(gaps) {
    return (gaps || []).map((g, i) => ({
        key: `pcg-${i}`,
        text: g.description,
        level: g.urgency,
    }));
}

function mapPatientCareManagement(cm) {
    if (!cm) return null;
    const subSections = [];

    if (cm.carePrograms?.length > 0) {
        subSections.push({
            key: 'sub-programs',
            label: null,
            componentOverride: 'chip-group',
            items: cm.carePrograms.map((prog) => ({
                key: prog.name,
                label: `${prog.name} · ${prog.status} · Since ${prog.startDate}`,
            })),
        });
    }
    if (cm.barriers?.length > 0) {
        subSections.push({
            key: 'sub-barriers',
            label: 'Barriers',
            componentOverride: 'alert-list',
            items: cm.barriers.map((b, i) => ({ key: `pb-${i}`, text: b, level: 'info' })),
        });
    }
    if (cm.careTeam?.length > 0) {
        subSections.push({
            key: 'sub-team',
            label: 'Care Team',
            items: cm.careTeam.map((member) => ({
                key: member.name,
                primary: member.name,
                secondary: member.role,
                isDetail: false,
                computedClass: 'bullet-item',
            })),
        });
    }

    return subSections.length > 0 ? subSections : null;
}

/* ══════════════════════════════════════
   PROVIDER DATA SELECTORS
   ══════════════════════════════════════ */

function buildProviderSnapshot(ps) {
    if (!ps) return [];
    const rows = [
        { key: 'npi', label: 'NPI', value: `${ps.npi} (${ps.npiType})` },
        { key: 'name', label: 'Name', value: ps.name },
        { key: 'spec', label: 'Specialty', value: ps.specialty },
        { key: 'tin', label: 'Tax ID (TIN)', value: ps.taxId },
        { key: 'addr', label: 'Address', value: ps.address },
        { key: 'phone', label: 'Phone', value: ps.phone },
    ];
    if (ps.rosterSize) {
        rows.push({ key: 'roster', label: 'Roster Size', value: `${ps.rosterSize} physicians` });
    }
    if (ps.specialtiesOffered?.length > 0) {
        rows.push({ key: 'specs', label: 'Specialties', value: ps.specialtiesOffered.join(', ') });
    }
    if (ps.acceptingNewPatients !== null && ps.acceptingNewPatients !== undefined) {
        rows.push({
            key: 'anp',
            label: 'Accepting New Patients',
            value: ps.acceptingNewPatients ? 'Yes' : 'No',
            statusValue: ps.acceptingNewPatients ? 'Yes' : 'No',
            statusClass: ps.acceptingNewPatients ? 'badge-success' : 'badge-error',
        });
    }
    return rows;
}

function mapProviderCredentials(cred) {
    if (!cred) return [];
    const rows = [];

    if (cred.stateLicense) {
        rows.push({
            key: 'lic',
            primary: 'State License',
            secondary: `${cred.stateLicense.number} · ${cred.stateLicense.state}`,
            badge: cred.stateLicense.status,
            badgeClass: statusBadgeClass(cred.stateLicense.status),
            metaItems: cred.stateLicense.expiryDate ? [{ key: 'lic-exp', text: `Expires ${cred.stateLicense.expiryDate}` }] : [],
            isDetail: true,
            hasMetaLine: true,
            computedClass: 'cred-item',
        });
    }
    if (cred.facilityLicense) {
        rows.push({
            key: 'flic',
            primary: 'Facility License',
            secondary: cred.facilityLicense,
            badge: 'Active',
            badgeClass: 'badge-success',
            isDetail: true,
            hasMetaLine: true,
            metaItems: [],
            computedClass: 'cred-item',
        });
    }
    if (cred.cmsCertification) {
        rows.push({
            key: 'cms',
            primary: 'CMS Certification',
            secondary: cred.cmsCertification,
            badge: 'Active',
            badgeClass: 'badge-success',
            isDetail: true,
            hasMetaLine: true,
            metaItems: [],
            computedClass: 'cred-item',
        });
    }
    if (cred.accreditation) {
        rows.push({
            key: 'accred',
            primary: 'Accreditation',
            secondary: cred.accreditation,
            badge: 'Accredited',
            badgeClass: 'badge-success',
            isDetail: true,
            hasMetaLine: true,
            metaItems: [],
            computedClass: 'cred-item',
        });
    }
    if (cred.cliaCertificate) {
        rows.push({
            key: 'clia',
            primary: 'CLIA Certificate',
            secondary: cred.cliaCertificate,
            badge: 'Active',
            badgeClass: 'badge-success',
            isDetail: true,
            hasMetaLine: true,
            metaItems: [],
            computedClass: 'cred-item',
        });
    }
    if (cred.boardCertifications?.length > 0) {
        rows.push({
            key: 'board',
            primary: 'Board Certifications',
            secondary: cred.boardCertifications.map((bc) => bc.name).join(', '),
            badge: 'Active',
            badgeClass: 'badge-success',
            metaItems: cred.boardCertifications.length > 2 ? [{ key: 'board-more', text: `+${cred.boardCertifications.length - 2} more` }] : [],
            isDetail: true,
            hasMetaLine: true,
            computedClass: 'cred-item',
        });
    }
    if (cred.dea?.number) {
        rows.push({
            key: 'dea',
            primary: 'DEA Registration',
            secondary: cred.dea.number,
            badge: cred.dea.status,
            badgeClass: statusBadgeClass(cred.dea.status),
            metaItems: cred.dea.expiryDate ? [{ key: 'dea-exp', text: `Expires ${cred.dea.expiryDate}` }] : [],
            isDetail: true,
            hasMetaLine: true,
            computedClass: 'cred-item',
        });
    }
    if (cred.malpracticeInsurance?.carrier) {
        rows.push({
            key: 'mal',
            primary: 'Malpractice Insurance',
            secondary: cred.malpracticeInsurance.carrier,
            badge: cred.malpracticeInsurance.status,
            badgeClass: statusBadgeClass(cred.malpracticeInsurance.status),
            metaItems: cred.malpracticeInsurance.expiryDate ? [{ key: 'mal-exp', text: `Expires ${cred.malpracticeInsurance.expiryDate}` }] : [],
            isDetail: true,
            hasMetaLine: true,
            computedClass: 'cred-item',
        });
    }
    if (cred.lastCredentialingDate) {
        rows.push({
            key: 'lastcred',
            primary: 'Last Credentialing',
            secondary: cred.lastCredentialingDate,
            metaItems: cred.nextRecredentialingDue ? [{ key: 'nextcred', text: `Next due: ${cred.nextRecredentialingDue}` }] : [],
            isDetail: true,
            hasMetaLine: !!cred.nextRecredentialingDue,
            computedClass: 'cred-item',
        });
    }
    return rows;
}

function mapProviderNetworks(networks) {
    return (networks || []).map((n, i) => ({
        key: `net-${i}`,
        primary: n.networkName,
        secondary: `Eff: ${n.effectiveDate}`,
        badge: n.contractStatus,
        badgeClass: statusBadgeClass(n.contractStatus),
        metaItems: [
            { key: `net-${i}-panel`, text: `Panel: ${n.panelStatus}` },
            ...(n.feeScheduleTier ? [{ key: `net-${i}-fee`, text: n.feeScheduleTier }] : []),
        ],
        isDetail: true,
        hasMetaLine: true,
        computedClass: 'detail-item',
        extraBadges: [
            { label: `Panel: ${n.panelStatus}`, badgeClass: n.panelStatus === 'Closed' ? 'badge-error' : 'badge-success' },
        ],
    }));
}

function mapProviderOpenCases(cases) {
    return (cases || []).map((c, i) => ({
        key: `poc-${i}`,
        primary: c.type,
        secondary: c.caseNumber,
        badge: c.status,
        badgeClass: statusBadgeClass(c.status),
        isDetail: false,
        computedClass: 'bullet-item',
    }));
}

function mapProviderAdverseActions(actions) {
    return (actions || []).map((aa) => ({
        key: aa.type,
        primary: aa.type,
        secondary: aa.description,
        badge: aa.status,
        badgeClass: 'badge-error',
        isDetail: false,
        computedClass: 'bullet-item',
    }));
}

function mapProviderRoster(roster) {
    return (roster || []).map((r, i) => ({
        key: `roster-${i}`,
        label: `${r.name} · ${r.specialty}`,
        dotColor: r.credentialStatus,
        dotClass: `chip-dot chip-dot-${r.credentialStatus}`,
    }));
}

/* ══════════════════════════════════════
   SECTION DEFINITIONS
   ══════════════════════════════════════ */

const SECTION_DEFS = [
    /* ── MEMBER ── */
    {
        id: 'identityPlan',
        component: 'identity-grid',
        personas: ['member'],
        dataSelector: (d) => buildMemberIdentity(d.identityPlan),
    },
    {
        id: 'alerts',
        component: 'alert-list',
        title: 'Alerts & Flags',
        icon: 'utility:warning',
        iconClass: 'alert-icon',
        personas: ['member'],
        dataSelector: (d) => mapAlerts(d.alerts),
        countSelector: (d) => d.alerts?.length,
    },
    {
        id: 'conditions',
        component: 'bullet-list',
        title: 'Active Conditions',
        icon: 'utility:heart',
        personas: ['member'],
        dataSelector: (d) => mapMemberConditions(d.conditions),
        countSelector: (d) => d.conditions?.length,
    },
    {
        id: 'claimsOverview',
        component: 'bullet-list',
        title: 'Claims Overview',
        icon: 'utility:moneybag',
        personas: ['member'],
        dataSelector: (d) => mapMemberClaims(d.claimsOverview),
        countSelector: (d) => d.claimsOverview?.length,
    },
    {
        id: 'priorAuthAppeals',
        component: 'composite',
        title: 'Prior Auth & Appeals',
        icon: 'utility:edit_form',
        personas: ['member'],
        dataSelector: (d) => mapMemberPriorAuths(d.priorAuthAppeals),
    },
    {
        id: 'memberOpenCases',
        component: 'bullet-list',
        title: 'Open Cases',
        icon: 'utility:cases',
        personas: ['member'],
        dataSelector: (d) => mapMemberOpenCases(d.openCases),
        countSelector: (d) => d.openCases?.length,
    },
    {
        id: 'memberCareGaps',
        component: 'alert-list',
        title: 'Care Gaps & Barriers',
        icon: 'utility:task',
        personas: ['member'],
        dataSelector: (d) => mapMemberCareGaps(d.careGaps),
    },

    /* ── PATIENT ── */
    {
        id: 'identityDemographics',
        component: 'identity-grid',
        personas: ['patient'],
        dataSelector: (d) => buildPatientIdentity(d.identityDemographics),
    },
    {
        id: 'clinicalSnapshot',
        component: 'bullet-list',
        title: 'Clinical Snapshot',
        icon: 'utility:heart',
        personas: ['patient'],
        dataSelector: (d) => mapPatientConditions(d.clinicalSnapshot),
        countSelector: (d) => d.clinicalSnapshot?.length,
    },
    {
        id: 'medications',
        component: 'bullet-list',
        title: 'Active Medications',
        icon: 'utility:pills',
        personas: ['patient'],
        dataSelector: (d) => mapPatientMedications(d.medications),
        countSelector: (d) => d.medications?.length,
    },
    {
        id: 'activity',
        component: 'composite',
        title: 'Recent & Upcoming Activity',
        icon: 'utility:event',
        personas: ['patient'],
        dataSelector: (d) => mapPatientActivity(d.recentActivity),
    },
    {
        id: 'referrals',
        component: 'bullet-list',
        title: 'Referrals',
        icon: 'utility:link',
        personas: ['patient'],
        dataSelector: (d) => mapPatientReferrals(d.referrals),
        countSelector: (d) => d.referrals?.length,
    },
    {
        id: 'patientCareGaps',
        component: 'alert-list',
        title: 'Care Gaps & Alerts',
        icon: 'utility:warning',
        iconClass: 'alert-icon',
        personas: ['patient'],
        dataSelector: (d) => mapPatientCareGaps(d.careGaps),
        countSelector: (d) => d.careGaps?.length,
    },
    {
        id: 'careManagement',
        component: 'composite',
        title: 'Care Management',
        icon: 'utility:task',
        personas: ['patient'],
        dataSelector: (d) => mapPatientCareManagement(d.careManagement),
    },

    /* ── PROVIDER ── */
    {
        id: 'providerSnapshot',
        component: 'identity-grid',
        personas: ['provider'],
        dataSelector: (d) => buildProviderSnapshot(d.providerSnapshot),
    },
    {
        id: 'credentialing',
        component: 'bullet-list',
        title: 'Credentialing & Compliance',
        icon: 'utility:shield',
        personas: ['provider'],
        dataSelector: (d) => mapProviderCredentials(d.credentialing),
    },
    {
        id: 'network',
        component: 'bullet-list',
        title: 'Network Participation',
        icon: 'utility:world',
        personas: ['provider'],
        dataSelector: (d) => mapProviderNetworks(d.networkParticipation),
        countSelector: (d) => d.networkParticipation?.length,
    },
    {
        id: 'providerOpenCases',
        component: 'bullet-list',
        title: 'Open Cases',
        icon: 'utility:cases',
        personas: ['provider'],
        dataSelector: (d) => mapProviderOpenCases(d.openCases),
        countSelector: (d) => d.openCases?.length,
    },
    {
        id: 'adverseActions',
        component: 'bullet-list-or-empty',
        title: 'Adverse Actions',
        icon: 'utility:ban',
        personas: ['provider'],
        dataSelector: (d) => mapProviderAdverseActions(d.adverseActions),
        emptyMessage: '\u2705 No adverse actions on file.',
    },
    {
        id: 'roster',
        component: 'chip-group',
        title: 'Roster Overview',
        icon: 'utility:people',
        personas: ['provider'],
        dataSelector: (d) => mapProviderRoster(d.roster),
        countSelector: (d) => {
            const count = d.roster?.length;
            return count ? `${count} shown` : undefined;
        },
        summarySelector: (d) => {
            const shown = d.roster?.length || 0;
            const total = d.providerSnapshot?.rosterSize || shown;
            return shown > 0 ? `Showing ${shown} of ${total}` : '';
        },
    },
];

/* ══════════════════════════════════════
   PUBLIC API
   ══════════════════════════════════════ */

/**
 * Build the list of renderable sections for the given persona and data.
 * Returns an array of section descriptors the template can iterate.
 */
export function buildSections(persona, ahisData) {
    if (!ahisData) return [];

    return SECTION_DEFS.filter((def) => def.personas.includes(persona))
        .map((def) => {
            const data = def.dataSelector(ahisData);
            const isEmpty = !data || (Array.isArray(data) && data.length === 0);

            if (isEmpty && def.component !== 'bullet-list-or-empty') return null;

            const count = def.countSelector ? def.countSelector(ahisData) : undefined;
            const countStr = count !== undefined && count !== null ? String(count) : undefined;

            return {
                id: def.id,
                component: def.component,
                title: def.title || null,
                icon: def.icon || null,
                iconClass: def.iconClass || '',
                count: countStr,
                data: data || [],
                hasData: !isEmpty,
                emptyMessage: def.emptyMessage || null,
                summary: def.summarySelector ? def.summarySelector(ahisData) : null,

                isIdentityGrid: def.component === 'identity-grid',
                isAlertList: def.component === 'alert-list',
                isBulletList: def.component === 'bullet-list',
                isChipGroup: def.component === 'chip-group',
                isComposite: def.component === 'composite',
                isBulletListOrEmpty: def.component === 'bullet-list-or-empty',
            };
        })
        .filter(Boolean);
}
