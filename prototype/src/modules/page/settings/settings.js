import { LightningElement, track } from 'lwc';

// ─── Object Catalogs ──────────────────────────────────────────────────────────

const MEMBER_SF_CATALOG = [
    { id: 'mp', label: 'MemberPlan' },
    { id: 'ind', label: 'IndividualApplication' },
    { id: 'cov', label: 'Coverage' },
    { id: 'ben', label: 'Benefit' },
    { id: 'pa', label: 'PriorAuthorization' },
    { id: 'claim', label: 'Claim' },
    { id: 'appeal', label: 'Appeal' },
    { id: 'griev', label: 'Grievance' },
    { id: 'case', label: 'Case' },
    { id: 'cg', label: 'CareGap' },
    { id: 'cb', label: 'CareBarrier' },
];

const PATIENT_SF_CATALOG = [
    { id: 'hc', label: 'HealthCondition' },
    { id: 'enc', label: 'ClinicalEncounter' },
    { id: 'encDx', label: 'ClinicalEncounterDiagnosis' },
    { id: 'med', label: 'PatientMedicationDosage' },
    { id: 'allergy', label: 'AllergyIntolerance' },
    { id: 'imm', label: 'Immunization' },
    { id: 'proc', label: 'PatientMedicalProcedure' },
    { id: 'csr', label: 'ClinicalServiceRequest' },
    { id: 'sa', label: 'ServiceAppointment' },
    { id: 'obs', label: 'Observation' },
    { id: 'diag', label: 'DiagnosticReport' },
    { id: 'caseP', label: 'Case' },
    { id: 'cgP', label: 'CareGap' },
    { id: 'cbP', label: 'CareBarrier' },
];

const PROVIDER_SF_CATALOG = [
    { id: 'prov', label: 'HealthcareProvider' },
    { id: 'provRole', label: 'HealthcareProviderSpecialty' },
    { id: 'cred', label: 'Credential' },
    { id: 'lic', label: 'StateLicense' },
    { id: 'dea', label: 'DEALicense' },
    { id: 'board', label: 'BoardCertification' },
    { id: 'malp', label: 'MalpracticeInsurance' },
    { id: 'net', label: 'NetworkParticipation' },
    { id: 'contract', label: 'ProviderContract' },
    { id: 'adv', label: 'AdverseAction' },
    { id: 'caseV', label: 'Case' },
    // PNM Add-On (266+)
    { id: 'pnmApp', label: 'ProviderApplication', isPnm: true },
    { id: 'pnmCred', label: 'CredentialingRecord', isPnm: true },
    { id: 'pnmContract', label: 'ContractingRecord', isPnm: true },
];

const EHR_CATALOG = [
    { id: 'fhirPatient', label: 'Patient' },
    { id: 'fhirCond', label: 'Condition' },
    { id: 'fhirMed', label: 'MedicationRequest' },
    { id: 'fhirAllergy', label: 'AllergyIntolerance' },
    { id: 'fhirEnc', label: 'Encounter' },
    { id: 'fhirObs', label: 'Observation' },
    { id: 'fhirProc', label: 'Procedure' },
    { id: 'fhirImm', label: 'Immunization' },
    { id: 'fhirDiag', label: 'DiagnosticReport' },
    { id: 'fhirProv', label: 'Practitioner' },
    { id: 'fhirProvRole', label: 'PractitionerRole' },
];

const DATA360_MEMBER_CATALOG = [
    { id: 'd360claim', label: 'Claim_DMO' },
    { id: 'd360pa', label: 'PriorAuth_DMO' },
    { id: 'd360appeal', label: 'Appeal_DMO' },
    { id: 'd360griev', label: 'Grievance_DMO' },
    { id: 'd360cov', label: 'Coverage_DMO' },
    { id: 'd360pharm', label: 'PharmacyClaim_DMO' },
];

const DATA360_PATIENT_CATALOG = [
    { id: 'd360pEnc', label: 'ClinicalEncounter_DMO' },
    { id: 'd360pMed', label: 'Medication_DMO' },
    { id: 'd360pLab', label: 'LabResult_DMO' },
    { id: 'd360pCare', label: 'CareActivity_DMO' },
];

const DATA360_PROVIDER_CATALOG = [
    { id: 'd360pvCred', label: 'Credential_DMO' },
    { id: 'd360pvNet', label: 'NetworkContract_DMO' },
    { id: 'd360pvSanction', label: 'Sanction_DMO' },
    { id: 'd360pvFee', label: 'FeeSchedule_DMO' },
];

const NAMED_CREDENTIAL_OPTIONS = [
    { label: 'Select Named Credential...', value: '' },
    { label: 'Epic_FHIR_Credential', value: 'epic_fhir' },
    { label: 'Cerner_FHIR_Credential', value: 'cerner_fhir' },
    { label: 'Allscripts_FHIR_Credential', value: 'allscripts_fhir' },
    { label: 'Generic_FHIR_Credential', value: 'generic_fhir' },
];

const PROVIDER_SUBTYPE_OPTIONS = [
    { label: 'Individual Provider', value: 'individual' },
    { label: 'Facility', value: 'facility' },
    { label: 'Provider Group', value: 'group' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function initObjectList(catalog, selectedIds = []) {
    return catalog.map((o) => ({ ...o, selected: selectedIds.includes(o.id), isPnm: o.isPnm || false }));
}

function chipClass(selected) {
    return selected ? 'chip chip_selected' : 'chip';
}

function withChipClass(arr) {
    return arr.map((o) => ({ ...o, chipClass: chipClass(o.selected) }));
}

// ─── Component ───────────────────────────────────────────────────────────────

export default class Settings extends LightningElement {

    // Nav
    @track activeNav = 'member';

    // Global save banner
    @track showSaveBanner = false;

    // ── Member ──────────────────────────────────────────────────────────────
    @track memberEnabled = true;
    @track memberPermissionsAssigned = false;
    @track memberNamedCredential = '';
    @track memberData360Enabled = false;
    @track memberConnectorCreated = false;
    @track _memberSfObjects = initObjectList(MEMBER_SF_CATALOG, ['mp', 'cov', 'pa', 'claim', 'appeal', 'case']);
    @track _ehrObjectsMember = initObjectList(EHR_CATALOG, []);
    @track _data360MemberObjects = initObjectList(DATA360_MEMBER_CATALOG, ['d360claim', 'd360pa', 'd360appeal']);

    // ── Patient ─────────────────────────────────────────────────────────────
    @track patientEnabled = true;
    @track patientPermissionsAssigned = false;
    @track patientNamedCredential = '';
    @track patientData360Enabled = false;
    @track patientConnectorCreated = false;
    @track _patientSfObjects = initObjectList(PATIENT_SF_CATALOG, ['hc', 'enc', 'med', 'allergy', 'imm', 'csr', 'sa']);
    @track _ehrObjectsPatient = initObjectList(EHR_CATALOG, []);
    @track _data360PatientObjects = initObjectList(DATA360_PATIENT_CATALOG, []);

    // ── Provider ────────────────────────────────────────────────────────────
    @track providerEnabled = false;
    @track providerPermissionsAssigned = false;
    @track providerNamedCredential = '';
    @track providerData360Enabled = false;
    @track providerConnectorCreated = false;
    @track providerSubTypes = ['individual'];
    @track _providerSfObjects = initObjectList(PROVIDER_SF_CATALOG, ['prov', 'provRole', 'cred', 'lic', 'net', 'adv']);
    @track _ehrObjectsProvider = initObjectList(EHR_CATALOG, []);
    @track _data360ProviderObjects = initObjectList(DATA360_PROVIDER_CATALOG, []);

    // ─── Nav ──────────────────────────────────────────────────────────────────

    get navItems() {
        return [
            { id: 'member',   label: 'Member Summary',   icon: 'utility:identity', isActive: this.activeNav === 'member',   isConfigured: this.memberEnabled,   cssClass: this._navClass('member') },
            { id: 'patient',  label: 'Patient Summary',  icon: 'utility:heart',    isActive: this.activeNav === 'patient',  isConfigured: this.patientEnabled,  cssClass: this._navClass('patient') },
            { id: 'provider', label: 'Provider Summary', icon: 'utility:groups',   isActive: this.activeNav === 'provider', isConfigured: this.providerEnabled, cssClass: this._navClass('provider') },
        ];
    }

    _navClass(id) {
        return `slds-nav-vertical__action${this.activeNav === id ? ' slds-is-active' : ''}`;
    }

    get isMemberActive()   { return this.activeNav === 'member'; }
    get isPatientActive()  { return this.activeNav === 'patient'; }
    get isProviderActive() { return this.activeNav === 'provider'; }

    handleNavClick(event) {
        this.activeNav = event.currentTarget.dataset.id;
    }

    // ─── Shared ───────────────────────────────────────────────────────────────

    get namedCredentialOptions() { return NAMED_CREDENTIAL_OPTIONS; }
    get providerSubTypeOptions() { return PROVIDER_SUBTYPE_OPTIONS; }

    handleObjectKeydown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            event.currentTarget.click();
        }
    }

    handleChipKeydown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            event.currentTarget.click();
        }
    }

    handleMulesoftDirect() {
        // eslint-disable-next-line no-console
        console.log('[PCC Setup] Navigate to Mulesoft Direct (prototype stub)');
    }

    handleSaveAll() {
        clearTimeout(this._saveTimeout);
        this.showSaveBanner = true;
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this._saveTimeout = setTimeout(() => { this.showSaveBanner = false; }, 3500);
    }

    handleCloseBanner() {
        this.showSaveBanner = false;
    }

    // ─── Member handlers ──────────────────────────────────────────────────────

    handleMemberToggle(event)         { this.memberEnabled = event.target.checked; }
    handleAssignMemberPermissions()    { this.memberPermissionsAssigned = !this.memberPermissionsAssigned; }
    handleMemberCredentialChange(e)    { this.memberNamedCredential = e.detail.value; }
    handleMemberData360Toggle(e)       { this.memberData360Enabled = e.target.checked; if (!this.memberData360Enabled) this.memberConnectorCreated = false; }
    handleCreateMemberConnector()      { this.memberConnectorCreated = true; }

    get memberPermBtnLabel()    { return this.memberPermissionsAssigned ? 'Revoke Permission Set' : 'Assign Permission Set'; }
    get memberConnectorBtnLabel() { return this.memberConnectorCreated ? 'Connector Created' : 'Create Connector'; }
    get memberEhrConnected()    { return !!this.memberNamedCredential; }
    get memberData360Connected(){ return this.memberData360Enabled && this.memberConnectorCreated; }

    get memberStep1Badge() { return this.memberPermissionsAssigned ? '\u2713' : '1'; }
    get memberStep2Badge() { return this.memberSelectedSfCount > 0 ? '\u2713' : '2'; }
    get memberStep3Badge() { return this.memberEhrConnected ? '\u2713' : '3'; }
    get memberStep4Badge() { return this.memberData360Connected ? '\u2713' : '4'; }

    get memberStep1BadgeClass() { return this._badgeClass(this.memberPermissionsAssigned); }
    get memberStep2BadgeClass() { return this._badgeClass(this.memberSelectedSfCount > 0); }
    get memberStep3BadgeClass() { return this._badgeClass(this.memberEhrConnected); }
    get memberStep4BadgeClass() { return this._badgeClass(this.memberData360Connected); }

    get memberAvailableSfObjects()  { return this._memberSfObjects.filter(o => !o.selected); }
    get memberSelectedSfObjects()   { return this._memberSfObjects.filter(o => o.selected); }
    get memberSelectedSfCount()     { return this.memberSelectedSfObjects.length; }
    get memberSfAvailableEmpty()    { return this.memberAvailableSfObjects.length === 0; }
    get memberSfSelectedEmpty()     { return this.memberSelectedSfObjects.length === 0; }

    handleAddSfObject(event)        { this._setSfSelected('_memberSfObjects', event.currentTarget.dataset.id, true); }
    handleRemoveSfObject(event)     { this._setSfSelected('_memberSfObjects', event.currentTarget.dataset.id, false); }
    handleAddAllMemberSf()          { this._memberSfObjects = this._memberSfObjects.map(o => ({ ...o, selected: true })); }
    handleRemoveAllMemberSf()       { this._memberSfObjects = this._memberSfObjects.map(o => ({ ...o, selected: false })); }

    get ehrObjects() {
        if (this.activeNav === 'member')   return withChipClass(this._ehrObjectsMember);
        if (this.activeNav === 'patient')  return withChipClass(this._ehrObjectsPatient);
        if (this.activeNav === 'provider') return withChipClass(this._ehrObjectsProvider);
        return [];
    }

    handleEhrChipToggle(event) {
        const id = event.currentTarget.dataset.id;
        const persona = event.currentTarget.dataset.persona;
        if (persona === 'member')   this._ehrObjectsMember   = this._ehrObjectsMember.map(o => o.id === id ? { ...o, selected: !o.selected } : o);
        if (persona === 'patient')  this._ehrObjectsPatient  = this._ehrObjectsPatient.map(o => o.id === id ? { ...o, selected: !o.selected } : o);
        if (persona === 'provider') this._ehrObjectsProvider = this._ehrObjectsProvider.map(o => o.id === id ? { ...o, selected: !o.selected } : o);
    }

    get data360MemberObjects()  { return withChipClass(this._data360MemberObjects); }

    handleData360ChipToggle(event) {
        const id = event.currentTarget.dataset.id;
        const persona = event.currentTarget.dataset.persona;
        if (persona === 'member')   this._data360MemberObjects   = this._data360MemberObjects.map(o => o.id === id ? { ...o, selected: !o.selected } : o);
        if (persona === 'patient')  this._data360PatientObjects  = this._data360PatientObjects.map(o => o.id === id ? { ...o, selected: !o.selected } : o);
        if (persona === 'provider') this._data360ProviderObjects = this._data360ProviderObjects.map(o => o.id === id ? { ...o, selected: !o.selected } : o);
    }

    // ─── Patient handlers ─────────────────────────────────────────────────────

    handlePatientToggle(event)        { this.patientEnabled = event.target.checked; }
    handleAssignPatientPermissions()   { this.patientPermissionsAssigned = !this.patientPermissionsAssigned; }
    handlePatientCredentialChange(e)   { this.patientNamedCredential = e.detail.value; }
    handlePatientData360Toggle(e)      { this.patientData360Enabled = e.target.checked; if (!this.patientData360Enabled) this.patientConnectorCreated = false; }
    handleCreatePatientConnector()     { this.patientConnectorCreated = true; }

    get patientPermBtnLabel()    { return this.patientPermissionsAssigned ? 'Revoke Permission Set' : 'Assign Permission Set'; }
    get patientConnectorBtnLabel() { return this.patientConnectorCreated ? 'Connector Created' : 'Create Connector'; }
    get patientEhrConnected()    { return !!this.patientNamedCredential; }
    get patientData360Connected(){ return this.patientData360Enabled && this.patientConnectorCreated; }

    get patientStep1Badge() { return this.patientPermissionsAssigned ? '\u2713' : '1'; }
    get patientStep2Badge() { return this.patientSelectedSfCount > 0 ? '\u2713' : '2'; }
    get patientStep3Badge() { return this.patientEhrConnected ? '\u2713' : '3'; }
    get patientStep4Badge() { return this.patientData360Connected ? '\u2713' : '4'; }

    get patientStep1BadgeClass() { return this._badgeClass(this.patientPermissionsAssigned); }
    get patientStep2BadgeClass() { return this._badgeClass(this.patientSelectedSfCount > 0); }
    get patientStep3BadgeClass() { return this._badgeClass(this.patientEhrConnected); }
    get patientStep4BadgeClass() { return this._badgeClass(this.patientData360Connected); }

    get patientAvailableSfObjects()  { return this._patientSfObjects.filter(o => !o.selected); }
    get patientSelectedSfObjects()   { return this._patientSfObjects.filter(o => o.selected); }
    get patientSelectedSfCount()     { return this.patientSelectedSfObjects.length; }
    get patientSfAvailableEmpty()    { return this.patientAvailableSfObjects.length === 0; }
    get patientSfSelectedEmpty()     { return this.patientSelectedSfObjects.length === 0; }

    handleAddPatientSfObject(event)   { this._setSfSelected('_patientSfObjects', event.currentTarget.dataset.id, true); }
    handleRemovePatientSfObject(event){ this._setSfSelected('_patientSfObjects', event.currentTarget.dataset.id, false); }
    handleAddAllPatientSf()           { this._patientSfObjects = this._patientSfObjects.map(o => ({ ...o, selected: true })); }
    handleRemoveAllPatientSf()        { this._patientSfObjects = this._patientSfObjects.map(o => ({ ...o, selected: false })); }

    get data360PatientObjects()  { return withChipClass(this._data360PatientObjects); }

    // ─── Provider handlers ────────────────────────────────────────────────────

    handleProviderToggle(event)       { this.providerEnabled = event.target.checked; }
    handleAssignProviderPermissions()  { this.providerPermissionsAssigned = !this.providerPermissionsAssigned; }
    handleProviderCredentialChange(e)  { this.providerNamedCredential = e.detail.value; }
    handleProviderData360Toggle(e)     { this.providerData360Enabled = e.target.checked; if (!this.providerData360Enabled) this.providerConnectorCreated = false; }
    handleCreateProviderConnector()    { this.providerConnectorCreated = true; }
    handleProviderSubTypeChange(e)     { this.providerSubTypes = e.detail.value; }

    get providerPermBtnLabel()    { return this.providerPermissionsAssigned ? 'Revoke Permission Set' : 'Assign Permission Set'; }
    get providerConnectorBtnLabel() { return this.providerConnectorCreated ? 'Connector Created' : 'Create Connector'; }
    get providerEhrConnected()    { return !!this.providerNamedCredential; }
    get providerData360Connected(){ return this.providerData360Enabled && this.providerConnectorCreated; }

    get providerStep1Badge() { return this.providerPermissionsAssigned ? '\u2713' : '1'; }
    get providerStep2Badge() { return this.providerSelectedSfCount > 0 ? '\u2713' : '2'; }
    get providerStep3Badge() { return this.providerEhrConnected ? '\u2713' : '3'; }
    get providerStep4Badge() { return this.providerData360Connected ? '\u2713' : '4'; }

    get providerStep1BadgeClass() { return this._badgeClass(this.providerPermissionsAssigned); }
    get providerStep2BadgeClass() { return this._badgeClass(this.providerSelectedSfCount > 0); }
    get providerStep3BadgeClass() { return this._badgeClass(this.providerEhrConnected); }
    get providerStep4BadgeClass() { return this._badgeClass(this.providerData360Connected); }

    get providerAvailableSfObjects()  { return this._providerSfObjects.filter(o => !o.selected); }
    get providerSelectedSfObjects()   { return this._providerSfObjects.filter(o => o.selected); }
    get providerSelectedSfCount()     { return this.providerSelectedSfObjects.length; }
    get providerSfAvailableEmpty()    { return this.providerAvailableSfObjects.length === 0; }
    get providerSfSelectedEmpty()     { return this.providerSelectedSfObjects.length === 0; }

    handleAddProviderSfObject(event)   { this._setSfSelected('_providerSfObjects', event.currentTarget.dataset.id, true); }
    handleRemoveProviderSfObject(event){ this._setSfSelected('_providerSfObjects', event.currentTarget.dataset.id, false); }
    handleAddAllProviderSf()           { this._providerSfObjects = this._providerSfObjects.map(o => ({ ...o, selected: true })); }
    handleRemoveAllProviderSf()        { this._providerSfObjects = this._providerSfObjects.map(o => ({ ...o, selected: false })); }

    get data360ProviderObjects()  { return withChipClass(this._data360ProviderObjects); }

    // ─── Private helpers ──────────────────────────────────────────────────────

    _setSfSelected(prop, id, selected) {
        this[prop] = this[prop].map(o => o.id === id ? { ...o, selected } : o);
    }

    _badgeClass(isComplete) {
        return isComplete ? 'setup-step-badge setup-step-badge_complete' : 'setup-step-badge';
    }
}
