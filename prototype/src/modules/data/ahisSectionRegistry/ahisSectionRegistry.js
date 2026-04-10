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

const STATUS_DOT_MAP = {
    Denied: 'status-dot status-dot-error',
    Overdue: 'status-dot status-dot-error',
    Expired: 'status-dot status-dot-error',
    Closed: 'status-dot status-dot-error',
    Expiring: 'status-dot status-dot-warning',
    Pending: 'status-dot status-dot-warning',
    'Pending approval': 'status-dot status-dot-warning',
    'Pending lab signature': 'status-dot status-dot-warning',
    'Under Review': 'status-dot status-dot-warning',
    'Under Investigation': 'status-dot status-dot-warning',
    Scheduled: 'status-dot status-dot-info',
    Approved: 'status-dot status-dot-success',
    Paid: 'status-dot status-dot-success',
    Active: 'status-dot status-dot-success',
    Accredited: 'status-dot status-dot-success',
    Complete: 'status-dot status-dot-success',
    Current: 'status-dot status-dot-success',
    Open: 'status-dot status-dot-info',
    New: 'status-dot status-dot-info',
    'Due Soon': 'status-dot status-dot-warning',
    'Not Started': 'status-dot status-dot-neutral',
};

function statusDotClass(status) {
    return STATUS_DOT_MAP[status] || 'status-dot status-dot-neutral';
}

function severityDotClass(severity) {
    const s = (severity || '').toLowerCase();
    if (s === 'high' || s === 'severe') return 'status-dot status-dot-error';
    if (s === 'moderate') return 'status-dot status-dot-warning';
    return 'status-dot status-dot-neutral';
}

function asBadge(badge, badgeClass) {
    return { badge, badgeClass, isBadge: true, isDot: false };
}

function asDot(label, dotClass) {
    return { badge: label, dotClass, isBadge: false, isDot: true };
}

function noIndicator() {
    return { badge: null, isBadge: false, isDot: false };
}

/* ══════════════════════════════════════
   MEMBER DATA SELECTORS
   ══════════════════════════════════════ */

function ageFromDob(dobStr) {
    if (!dobStr) return null;
    const [m, d, y] = dobStr.split('/').map(Number);
    const dob = new Date(y, m - 1, d);
    const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();
    const mDiff = now.getMonth() - dob.getMonth();
    if (mDiff < 0 || (mDiff === 0 && now.getDate() < dob.getDate())) age--;
    return age;
}

function lastInteractionLine(li) {
    if (!li) return null;
    return `Last interaction: ${li.daysAgo} days ago for ${li.reason}`;
}

function buildMemberIdentity(ip) {
    if (!ip) return {};
    const age = ageFromDob(ip.dob);
    const line1Parts = [ip.name, age != null ? `${age} yrs` : null, ip.language].filter(Boolean);
    const line2Parts = [ip.planName, ip.memberId ? `Member ID: ${ip.memberId}` : null, ip.pcp ? `PCP: ${ip.pcp}` : null].filter(Boolean);
    const line3 = lastInteractionLine(ip.lastInteraction);
    return {
        lines: [
            { key: 'l1', text: line1Parts.join(' | '), isPrimary: true },
            { key: 'l2', text: line2Parts.join(' | '), isPrimary: false },
            line3 ? { key: 'l3', text: line3, isPrimary: false } : null,
        ].filter(Boolean),
    };
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
        ...asDot(c.severity, severityDotClass(c.severity)),
        isDetail: false,
        computedClass: 'bullet-item',
    }));
}

function mapMemberClaims(claims) {
    return (claims || []).map((c, i) => {
        const isCritical = c.status === 'Denied';
        return {
            key: `clm-${i}`,
            primary: c.service,
            secondary: c.claimId,
            ...(isCritical ? asBadge(c.status, statusBadgeClass(c.status)) : asDot(c.status, statusDotClass(c.status))),
            metaItems: [
                { key: `clm-${i}-billed`, text: `Billed: ${c.billedAmount}` },
                { key: `clm-${i}-resp`, text: `Resp: ${c.patientResponsibility}` },
            ],
            note: null,
            isDetail: true,
            hasMetaLine: true,
            computedClass: 'detail-item',
        };
    });
}

function mapMemberPriorAuths(priorAuths) {
    return (priorAuths || []).map((pa, i) => ({
        key: `pa-${i}`,
        primary: pa.service,
        secondary: pa.authId,
        ...asDot(pa.status, statusDotClass(pa.status)),
        isDetail: false,
        computedClass: 'bullet-item',
    }));
}

function mapMemberAppeals(appeals) {
    return (appeals || []).map((a, i) => ({
        key: `apl-${i}`,
        primary: a.description,
        secondary: a.appealId,
        ...asBadge(`SLA: ${a.slaDaysRemaining} days`, 'badge-error'),
        isDetail: false,
        computedClass: 'bullet-item',
    }));
}

function mapMemberOpenCases(cases) {
    return (cases || []).map((c, i) => ({
        key: `oc-${i}`,
        primary: c.subject,
        secondary: c.caseNumber,
        ...asDot(c.status, statusDotClass(c.status)),
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
    if (!id) return {};
    const line1Parts = [id.name, id.age != null ? `${id.age} yrs` : null, id.language].filter(Boolean);
    const line2Parts = [id.mrn ? `MRN: ${id.mrn}` : null, id.pcp ? `PCP: ${id.pcp}` : null, id.riskLevel].filter(Boolean);
    const lc = id.lastContact;
    const line3 = lc ? `Last contact: ${lc.daysAgo} days ago via ${lc.channel} (${lc.topic})` : null;
    return {
        lines: [
            { key: 'l1', text: line1Parts.join(' | '), isPrimary: true },
            { key: 'l2', text: line2Parts.join(' | '), isPrimary: false },
            line3 ? { key: 'l3', text: line3, isPrimary: false } : null,
        ].filter(Boolean),
    };
}

function mapPatientConditions(snapshot) {
    return (snapshot || []).map((c, i) => ({
        key: `cond-${i}`,
        primary: c.name,
        secondary: [c.stage, c.onsetDate ? `onset ${c.onsetDate}` : ''].filter(Boolean).join(' · ') || undefined,
        ...asDot(c.severity, severityDotClass(c.severity)),
        isDetail: false,
        computedClass: 'bullet-item',
    }));
}

function mapPatientMedications(meds) {
    return (meds || []).map((m, i) => ({
        key: `med-${i}`,
        primary: m.name,
        secondary: [m.dose, m.frequency].filter(Boolean).join(' — '),
        ...(m.refillAlert ? asBadge(m.refillAlert, 'badge-warning') : noIndicator()),
        metaItems: m.prescriber ? [{ key: `med-${i}-presc`, text: m.prescriber }] : [],
        note: m.sideEffects || null,
        isDetail: true,
        hasMetaLine: !!m.prescriber,
        computedClass: 'detail-item',
    }));
}

function mapPatientEncounters(encounters) {
    return (encounters || []).map((enc) => ({
        key: enc.date,
        primary: enc.type,
        secondary: `${enc.reason} — ${enc.date}` + (enc.provider ? ` · ${enc.provider}` : ''),
        ...noIndicator(),
        isDetail: false,
        computedClass: 'bullet-item',
    }));
}

function mapPatientScheduledProcedures(procedures) {
    return (procedures || []).map((p, i) => ({
        key: `proc-${i}`,
        primary: p.name,
        secondary: `${p.date}${p.status ? ` · ${p.status}` : ''}`,
        ...noIndicator(),
        isDetail: false,
        computedClass: 'bullet-item',
    }));
}

function mapPatientPendingLabs(labs) {
    return (labs || []).map((l, i) => ({
        key: `lab-${i}`,
        primary: l.name,
        secondary: `Ordered: ${l.orderedDate}${l.status ? ` · ${l.status}` : ''}`,
        ...noIndicator(),
        isDetail: false,
        computedClass: 'bullet-item',
    }));
}

function mapPatientImmunizations(immunizations) {
    return (immunizations || []).map((imm, i) => {
        const isCritical = imm.status === 'Overdue';
        return {
            key: `imm-${i}`,
            primary: imm.name,
            ...(isCritical
                ? asBadge(imm.status, 'badge-error')
                : asDot(imm.status, statusDotClass(imm.status))),
            isDetail: false,
            computedClass: 'bullet-item',
        };
    });
}

function mapPatientReferrals(referrals) {
    return (referrals || []).map((r, i) => ({
        key: `ref-${i}`,
        primary: r.specialty,
        secondary: `from ${r.referringProvider} · ${r.date}`,
        ...asDot(r.status, statusDotClass(r.status)),
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

function mapCarePrograms(carePrograms) {
    return (carePrograms || []).map((prog) => ({
        key: prog.name,
        label: `${prog.name} · ${prog.status} · Since ${prog.startDate}`,
    }));
}

function mapCareBarriers(barriers) {
    return (barriers || []).map((b, i) => ({ key: `pb-${i}`, text: b, level: 'info' }));
}

function mapCareTeam(careTeam) {
    return (careTeam || []).map((member) => ({
        key: member.name,
        primary: member.name,
        secondary: member.role,
        ...noIndicator(),
        isDetail: false,
        computedClass: 'bullet-item',
    }));
}

/* ══════════════════════════════════════
   PROVIDER DATA SELECTORS
   ══════════════════════════════════════ */

function buildProviderSnapshot(ps) {
    if (!ps) return {};
    const line1Parts = [ps.name, ps.specialty].filter(Boolean);
    const line2Parts = [ps.npi ? `NPI: ${ps.npi}` : null, ps.phone, ps.acceptingNewPatients != null ? (ps.acceptingNewPatients ? 'Accepting Patients' : 'Not Accepting') : null].filter(Boolean);
    const line3 = lastInteractionLine(ps.lastInteraction);
    return {
        lines: [
            { key: 'l1', text: line1Parts.join(' | '), isPrimary: true },
            { key: 'l2', text: line2Parts.join(' | '), isPrimary: false },
            line3 ? { key: 'l3', text: line3, isPrimary: false } : null,
        ].filter(Boolean),
    };
}

function credIndicator(status) {
    if (!status) return noIndicator();
    const critical = ['Expiring', 'Expired'].includes(status);
    return critical ? asBadge(status, statusBadgeClass(status)) : asDot(status, statusDotClass(status));
}

function mapProviderCredentials(cred) {
    if (!cred) return [];
    const rows = [];

    if (cred.stateLicense) {
        rows.push({
            key: 'lic',
            primary: 'State License',
            secondary: `${cred.stateLicense.number} · ${cred.stateLicense.state}`,
            ...credIndicator(cred.stateLicense.status),
            metaItems: cred.stateLicense.expiryDate ? [{ key: 'lic-exp', text: `Expires ${cred.stateLicense.expiryDate}` }] : [],
            isDetail: true,
            hasMetaLine: true,
            computedClass: 'detail-item',
        });
    }
    if (cred.facilityLicense) {
        rows.push({
            key: 'flic',
            primary: 'Facility License',
            secondary: cred.facilityLicense,
            ...asDot('Active', statusDotClass('Active')),
            isDetail: true,
            hasMetaLine: false,
            metaItems: [],
            computedClass: 'detail-item',
        });
    }
    if (cred.cmsCertification) {
        rows.push({
            key: 'cms',
            primary: 'CMS Certification',
            secondary: cred.cmsCertification,
            ...asDot('Active', statusDotClass('Active')),
            isDetail: true,
            hasMetaLine: false,
            metaItems: [],
            computedClass: 'detail-item',
        });
    }
    if (cred.accreditation) {
        rows.push({
            key: 'accred',
            primary: 'Accreditation',
            secondary: cred.accreditation,
            ...asDot('Accredited', statusDotClass('Accredited')),
            isDetail: true,
            hasMetaLine: false,
            metaItems: [],
            computedClass: 'detail-item',
        });
    }
    if (cred.cliaCertificate) {
        rows.push({
            key: 'clia',
            primary: 'CLIA Certificate',
            secondary: cred.cliaCertificate,
            ...asDot('Active', statusDotClass('Active')),
            isDetail: true,
            hasMetaLine: false,
            metaItems: [],
            computedClass: 'detail-item',
        });
    }
    if (cred.boardCertifications?.length > 0) {
        const visible = cred.boardCertifications.slice(0, 2);
        const extraCount = cred.boardCertifications.length - 2;
        const extraMeta = extraCount > 0 ? [{ key: 'board-more', text: `+${extraCount} more` }] : [];
        rows.push({
            key: 'board',
            primary: 'Board Certifications',
            secondary: visible.map((bc) => bc.name).join(', '),
            ...asDot('Active', statusDotClass('Active')),
            metaItems: extraMeta,
            isDetail: true,
            hasMetaLine: extraMeta.length > 0,
            computedClass: 'detail-item',
        });
    }
    if (cred.dea?.number) {
        rows.push({
            key: 'dea',
            primary: 'DEA Registration',
            secondary: cred.dea.number,
            ...credIndicator(cred.dea.status),
            metaItems: cred.dea.expiryDate ? [{ key: 'dea-exp', text: `Expires ${cred.dea.expiryDate}` }] : [],
            isDetail: true,
            hasMetaLine: true,
            computedClass: 'detail-item',
        });
    }
    if (cred.malpracticeInsurance?.carrier) {
        rows.push({
            key: 'mal',
            primary: 'Malpractice Insurance',
            secondary: cred.malpracticeInsurance.carrier,
            ...credIndicator(cred.malpracticeInsurance.status),
            metaItems: cred.malpracticeInsurance.expiryDate ? [{ key: 'mal-exp', text: `Expires ${cred.malpracticeInsurance.expiryDate}` }] : [],
            isDetail: true,
            hasMetaLine: true,
            computedClass: 'detail-item',
        });
    }
    if (cred.lastCredentialingDate) {
        rows.push({
            key: 'lastcred',
            primary: 'Last Credentialing',
            secondary: cred.lastCredentialingDate,
            ...noIndicator(),
            metaItems: cred.nextRecredentialingDue ? [{ key: 'nextcred', text: `Next due: ${cred.nextRecredentialingDue}` }] : [],
            isDetail: true,
            hasMetaLine: !!cred.nextRecredentialingDue,
            computedClass: 'detail-item',
        });
    }
    return rows;
}

function mapProviderNetworks(networks) {
    return (networks || []).map((n, i) => ({
        key: `net-${i}`,
        primary: n.networkName,
        secondary: `Eff: ${n.effectiveDate}`,
        ...asDot(n.contractStatus, statusDotClass(n.contractStatus)),
        metaItems: [
            { key: `net-${i}-panel`, text: `Panel: ${n.panelStatus}` },
            ...(n.feeScheduleTier ? [{ key: `net-${i}-fee`, text: n.feeScheduleTier }] : []),
        ],
        isDetail: true,
        hasMetaLine: true,
        computedClass: 'detail-item',
    }));
}

function mapProviderOpenCases(cases) {
    return (cases || []).map((c, i) => ({
        key: `poc-${i}`,
        primary: c.type,
        secondary: c.caseNumber,
        ...asDot(c.status, statusDotClass(c.status)),
        isDetail: false,
        computedClass: 'bullet-item',
    }));
}

function mapProviderAdverseActions(actions) {
    return (actions || []).map((aa) => ({
        key: aa.type,
        primary: aa.type,
        secondary: aa.description,
        ...asBadge(aa.status, 'badge-error'),
        isDetail: false,
        computedClass: 'bullet-item',
    }));
}

function credStatusDotClass(status) {
    if (status === 'yellow') return 'status-dot status-dot-warning';
    if (status === 'red') return 'status-dot status-dot-error';
    return 'status-dot status-dot-success';
}

function mapProviderRoster(roster) {
    return (roster || []).map((r, i) => ({
        key: `roster-${i}`,
        primary: r.name,
        secondary: r.specialty,
        isDot: true,
        isBadge: false,
        badge: null,
        dotClass: credStatusDotClass(r.credentialStatus),
        isDetail: false,
        computedClass: 'bullet-item',
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
        title: 'Clinical Profile',
        personas: ['member'],
        dataSelector: (d) => mapAlerts(d.alerts),
        countSelector: (d) => d.alerts?.length,
        sources: [
            { id: 'hc-alerts', name: 'Health Cloud', type: 'CRM', iconName: 'utility:salesforce1', recordUrl: '#' },
            { id: 'd360-alerts', name: 'Data 360', type: 'Zero-Copy', iconName: 'standard:data_streams', recordUrl: '#' },
        ],
    },
    {
        id: 'conditions',
        component: 'bullet-list',
        title: 'Active Conditions',
        personas: ['member'],
        dataSelector: (d) => mapMemberConditions(d.conditions),
        countSelector: (d) => d.conditions?.length,
        sources: [
            { id: 'hc-cond', name: 'Health Cloud', type: 'CRM', iconName: 'utility:salesforce1', recordUrl: '#' },
            { id: 'd360-cond', name: 'Data 360', type: 'Zero-Copy', iconName: 'standard:data_streams', recordUrl: '#' },
        ],
    },
    {
        id: 'claimsOverview',
        component: 'bullet-list',
        title: 'Claims Overview',
        personas: ['member'],
        dataSelector: (d) => mapMemberClaims(d.claimsOverview),
        countSelector: (d) => d.claimsOverview?.length,
        sources: [
            { id: 'hc-clm', name: 'Health Cloud', type: 'CRM', iconName: 'utility:salesforce1', recordUrl: '#' },
            { id: 'clapi', name: 'Claims API', type: 'External', iconName: 'standard:record', recordUrl: '#' },
        ],
    },
    {
        id: 'priorAuths',
        component: 'bullet-list',
        title: 'Prior Authorizations',
        personas: ['member'],
        dataSelector: (d) => mapMemberPriorAuths(d.priorAuthAppeals?.priorAuths),
        countSelector: (d) => d.priorAuthAppeals?.priorAuths?.length,
        sources: [
            { id: 'hc-pa', name: 'Health Cloud', type: 'CRM', iconName: 'utility:salesforce1', recordUrl: '#' },
        ],
    },
    {
        id: 'appeals',
        component: 'bullet-list',
        title: 'Appeals',
        personas: ['member'],
        dataSelector: (d) => mapMemberAppeals(d.priorAuthAppeals?.appeals),
        countSelector: (d) => d.priorAuthAppeals?.appeals?.length,
        sources: [
            { id: 'hc-apl', name: 'Health Cloud', type: 'CRM', iconName: 'utility:salesforce1', recordUrl: '#' },
        ],
    },
    {
        id: 'memberOpenCases',
        component: 'bullet-list',
        title: 'Open Cases',
        personas: ['member'],
        dataSelector: (d) => mapMemberOpenCases(d.openCases),
        countSelector: (d) => d.openCases?.length,
        sources: [
            { id: 'hc-oc', name: 'Health Cloud', type: 'CRM', iconName: 'utility:salesforce1', recordUrl: '#' },
        ],
    },
    {
        id: 'memberCareGaps',
        component: 'alert-list',
        title: 'Clinical Profile',
        personas: ['member'],
        dataSelector: (d) => mapMemberCareGaps(d.careGaps),
        countSelector: (d) => (d.careGaps?.gaps?.length || 0) + (d.careGaps?.barriers?.length || 0),
        sources: [
            { id: 'hc-cg', name: 'Health Cloud', type: 'CRM', iconName: 'utility:salesforce1', recordUrl: '#' },
            { id: 'd360-cg', name: 'Data 360', type: 'Zero-Copy', iconName: 'standard:data_streams', recordUrl: '#' },
        ],
    },

    /* ── PATIENT ── */
    {
        id: 'identityDemographics',
        component: 'identity-grid',
        personas: ['patient'],
        dataSelector: (d) => buildPatientIdentity(d.identityDemographics),
    },
    {
        id: 'patientCareGaps',
        component: 'alert-list',
        title: 'Clinical Profile',
        personas: ['patient'],
        dataSelector: (d) => mapPatientCareGaps(d.careGaps),
        countSelector: (d) => d.careGaps?.length,
        sources: [
            { id: 'hc-pcg', name: 'Health Cloud', type: 'CRM', iconName: 'utility:salesforce1', recordUrl: '#' },
            { id: 'd360-pcg', name: 'Data 360', type: 'Zero-Copy', iconName: 'standard:data_streams', recordUrl: '#' },
        ],
    },
    {
        id: 'clinicalSnapshot',
        component: 'bullet-list',
        title: 'Clinical Snapshot',
        personas: ['patient'],
        dataSelector: (d) => mapPatientConditions(d.clinicalSnapshot),
        countSelector: (d) => d.clinicalSnapshot?.length,
        sources: [
            { id: 'hc-cs', name: 'Health Cloud', type: 'CRM', iconName: 'utility:salesforce1', recordUrl: '#' },
            { id: 'ehr-cs', name: 'EHR System', type: 'External', iconName: 'standard:record', recordUrl: '#' },
        ],
    },
    {
        id: 'medications',
        component: 'bullet-list',
        title: 'Active Medications',
        personas: ['patient'],
        dataSelector: (d) => mapPatientMedications(d.medications),
        countSelector: (d) => d.medications?.length,
        sources: [
            { id: 'pharma', name: 'Pharmacy API', type: 'External', iconName: 'standard:medicine', recordUrl: '#' },
            { id: 'hc-med', name: 'Health Cloud', type: 'CRM', iconName: 'utility:salesforce1', recordUrl: '#' },
        ],
    },
    {
        id: 'encounters',
        component: 'bullet-list',
        title: 'Encounters',
        personas: ['patient'],
        dataSelector: (d) => mapPatientEncounters(d.recentActivity?.encounters),
        countSelector: (d) => d.recentActivity?.encounters?.length,
        sources: [
            { id: 'hc-enc', name: 'Health Cloud', type: 'CRM', iconName: 'utility:salesforce1', recordUrl: '#' },
        ],
    },
    {
        id: 'scheduledProcedures',
        component: 'bullet-list',
        title: 'Scheduled Procedures',
        personas: ['patient'],
        dataSelector: (d) => mapPatientScheduledProcedures(d.recentActivity?.scheduledProcedures),
        countSelector: (d) => d.recentActivity?.scheduledProcedures?.length,
        sources: [
            { id: 'hc-sp', name: 'Health Cloud', type: 'CRM', iconName: 'utility:salesforce1', recordUrl: '#' },
        ],
    },
    {
        id: 'pendingLabs',
        component: 'bullet-list',
        title: 'Pending Labs',
        personas: ['patient'],
        dataSelector: (d) => mapPatientPendingLabs(d.recentActivity?.pendingLabs),
        countSelector: (d) => d.recentActivity?.pendingLabs?.length,
        sources: [
            { id: 'hc-lab', name: 'Health Cloud', type: 'CRM', iconName: 'utility:salesforce1', recordUrl: '#' },
            { id: 'ehr-lab', name: 'Lab System', type: 'External', iconName: 'standard:record', recordUrl: '#' },
        ],
    },
    {
        id: 'immunizations',
        component: 'bullet-list',
        title: 'Immunizations',
        personas: ['patient'],
        dataSelector: (d) => mapPatientImmunizations(d.recentActivity?.immunizations),
        countSelector: (d) => d.recentActivity?.immunizations?.length,
        sources: [
            { id: 'hc-imm', name: 'Health Cloud', type: 'CRM', iconName: 'utility:salesforce1', recordUrl: '#' },
        ],
    },
    {
        id: 'referrals',
        component: 'bullet-list',
        title: 'Referrals',
        personas: ['patient'],
        dataSelector: (d) => mapPatientReferrals(d.referrals),
        countSelector: (d) => d.referrals?.length,
        sources: [
            { id: 'hc-ref', name: 'Health Cloud', type: 'CRM', iconName: 'utility:salesforce1', recordUrl: '#' },
        ],
    },
    {
        id: 'carePrograms',
        component: 'chip-group',
        title: 'Care Programs',
        personas: ['patient'],
        dataSelector: (d) => mapCarePrograms(d.careManagement?.carePrograms),
        countSelector: (d) => d.careManagement?.carePrograms?.length,
        sources: [
            { id: 'hc-cp', name: 'Health Cloud', type: 'CRM', iconName: 'utility:salesforce1', recordUrl: '#' },
        ],
    },
    {
        id: 'careBarriers',
        component: 'alert-list',
        title: 'Barriers',
        personas: ['patient'],
        dataSelector: (d) => mapCareBarriers(d.careManagement?.barriers),
        countSelector: (d) => d.careManagement?.barriers?.length,
        sources: [
            { id: 'hc-cb', name: 'Health Cloud', type: 'CRM', iconName: 'utility:salesforce1', recordUrl: '#' },
        ],
    },
    {
        id: 'careTeam',
        component: 'bullet-list',
        title: 'Care Team',
        personas: ['patient'],
        dataSelector: (d) => mapCareTeam(d.careManagement?.careTeam),
        countSelector: (d) => d.careManagement?.careTeam?.length,
        sources: [
            { id: 'hc-ct', name: 'Health Cloud', type: 'CRM', iconName: 'utility:salesforce1', recordUrl: '#' },
        ],
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
        personas: ['provider'],
        dataSelector: (d) => mapProviderCredentials(d.credentialing),
        countSelector: (d) => mapProviderCredentials(d.credentialing).length || undefined,
        sources: [
            { id: 'caqh', name: 'CAQH ProView', type: 'External', iconName: 'standard:record', recordUrl: '#' },
            { id: 'hc-cred', name: 'Health Cloud', type: 'CRM', iconName: 'utility:salesforce1', recordUrl: '#' },
        ],
    },
    {
        id: 'network',
        component: 'bullet-list',
        title: 'Network Participation',
        personas: ['provider'],
        dataSelector: (d) => mapProviderNetworks(d.networkParticipation),
        countSelector: (d) => d.networkParticipation?.length,
        sources: [
            { id: 'hc-net', name: 'Health Cloud', type: 'CRM', iconName: 'utility:salesforce1', recordUrl: '#' },
        ],
    },
    {
        id: 'providerOpenCases',
        component: 'bullet-list',
        title: 'Open Cases',
        personas: ['provider'],
        dataSelector: (d) => mapProviderOpenCases(d.openCases),
        countSelector: (d) => d.openCases?.length,
        sources: [
            { id: 'hc-poc', name: 'Health Cloud', type: 'CRM', iconName: 'utility:salesforce1', recordUrl: '#' },
        ],
    },
    {
        id: 'adverseActions',
        component: 'bullet-list-or-empty',
        title: 'Adverse Actions',
        personas: ['provider'],
        dataSelector: (d) => mapProviderAdverseActions(d.adverseActions),
        emptyMessage: 'No adverse actions on file.',
        sources: [
            { id: 'hc-aa', name: 'Health Cloud', type: 'CRM', iconName: 'utility:salesforce1', recordUrl: '#' },
            { id: 'npdb', name: 'NPDB', type: 'External', iconName: 'standard:record', recordUrl: '#' },
        ],
    },
    {
        id: 'roster',
        component: 'bullet-list',
        title: 'Roster Overview',
        personas: ['provider'],
        dataSelector: (d) => mapProviderRoster(d.roster),
        countSelector: (d) => d.roster?.length || undefined,
        sources: [
            { id: 'hc-roster', name: 'Health Cloud', type: 'CRM', iconName: 'utility:salesforce1', recordUrl: '#' },
        ],
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
            const isEmpty = !data || (Array.isArray(data) && data.length === 0) || (typeof data === 'object' && !Array.isArray(data) && !data.lines?.length);

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
                data: data || (def.component === 'identity-grid' ? {} : []),
                hasData: !isEmpty,
                emptyMessage: def.emptyMessage || null,
                summary: def.summarySelector ? def.summarySelector(ahisData) : null,
                sources: def.sources || [],

                isIdentityGrid: def.component === 'identity-grid',
                isAlertList: def.component === 'alert-list',
                isBulletList: def.component === 'bullet-list',
                isChipGroup: def.component === 'chip-group',
                isBulletListOrEmpty: def.component === 'bullet-list-or-empty',
            };
        })
        .filter(Boolean);
}
