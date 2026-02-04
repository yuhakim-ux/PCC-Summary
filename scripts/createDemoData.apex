/**
 * AHIS Demo Data Creation Script
 * Run this in Developer Console > Debug > Open Execute Anonymous Window
 * 
 * Creates a rich Account record (Maria Santos) with related records for the AHIS demo.
 * Uses try-catch for Health Cloud objects to gracefully skip unavailable objects.
 */

// ============ Configuration ============
String memberName = 'Maria Santos';
String memberDescription = 'AHIS Demo Member - 67F, Medicare Advantage, Chronic Care Management';

// ============ Step 1: Create Account ============
Account demoAccount;

// Check if account already exists
List<Account> existingAccounts = [SELECT Id, Name FROM Account WHERE Name = :memberName LIMIT 1];

if (!existingAccounts.isEmpty()) {
    demoAccount = existingAccounts[0];
    System.debug('Using existing account: ' + demoAccount.Id);
} else {
    demoAccount = new Account(
        Name = memberName,
        Description = memberDescription,
        Phone = '(415) 555-0142',
        BillingStreet = '742 Evergreen Terrace',
        BillingCity = 'San Francisco',
        BillingState = 'CA',
        BillingPostalCode = '94102',
        BillingCountry = 'United States',
        Type = 'Customer',
        Industry = 'Healthcare'
    );
    insert demoAccount;
    System.debug('Created new account: ' + demoAccount.Id);
}

Id accountId = demoAccount.Id;

// ============ Step 2: Create Tasks ============
List<Task> tasks = new List<Task>();

tasks.add(new Task(
    WhatId = accountId,
    Subject = 'Schedule Diabetic Eye Exam',
    Description = 'Contact ophthalmology to schedule annual retinopathy screening. Member prefers morning appointments.',
    Status = 'Open',
    Priority = 'High',
    ActivityDate = Date.today().addDays(7),
    OwnerId = UserInfo.getUserId()
));

tasks.add(new Task(
    WhatId = accountId,
    Subject = 'Weekly Check-in Call',
    Description = 'Discuss BP readings and medication adherence. Follow up on food assistance resources.',
    Status = 'Open',
    Priority = 'Normal',
    ActivityDate = Date.today().addDays(3),
    OwnerId = UserInfo.getUserId()
));

tasks.add(new Task(
    WhatId = accountId,
    Subject = 'SDOH Resource Connection',
    Description = 'Connect member with community food bank and SNAP benefits enrollment assistance.',
    Status = 'In Progress',
    Priority = 'High',
    ActivityDate = Date.today().addDays(5),
    OwnerId = UserInfo.getUserId()
));

tasks.add(new Task(
    WhatId = accountId,
    Subject = 'Medication Reconciliation',
    Description = 'Review all medications with member during next visit. Verify Lisinopril refill status.',
    Status = 'Not Started',
    Priority = 'Normal',
    ActivityDate = Date.today().addDays(10),
    OwnerId = UserInfo.getUserId()
));

tasks.add(new Task(
    WhatId = accountId,
    Subject = 'Care Plan Quarterly Review',
    Description = 'Review care plan progress and update Q2 goals. Discuss BP management strategy.',
    Status = 'Not Started',
    Priority = 'Normal',
    ActivityDate = Date.today().addDays(14),
    OwnerId = UserInfo.getUserId()
));

insert tasks;
System.debug('Created ' + tasks.size() + ' tasks');

// ============ Step 3: Create Events ============
List<Event> events = new List<Event>();

events.add(new Event(
    WhatId = accountId,
    Subject = 'Cardiology Follow-up - Dr. Wilson',
    Description = 'Follow-up appointment for cardiac monitoring. Review recent ECG results.',
    StartDateTime = Datetime.now().addDays(12).addHours(14),
    EndDateTime = Datetime.now().addDays(12).addHours(15),
    Location = 'Sunrise Medical Center, Suite 302',
    OwnerId = UserInfo.getUserId()
));

events.add(new Event(
    WhatId = accountId,
    Subject = 'Lab Work - Quarterly A1C',
    Description = 'Quarterly A1C test and comprehensive metabolic panel.',
    StartDateTime = Datetime.now().addDays(18).addHours(8),
    EndDateTime = Datetime.now().addDays(18).addHours(9),
    Location = 'LabCorp - Downtown SF',
    OwnerId = UserInfo.getUserId()
));

events.add(new Event(
    WhatId = accountId,
    Subject = 'Annual Wellness Visit - Dr. Chen',
    Description = 'Annual wellness exam with PCP. Review all chronic conditions and care plan.',
    StartDateTime = Datetime.now().addDays(28).addHours(10),
    EndDateTime = Datetime.now().addDays(28).addHours(11),
    Location = 'Sunrise Medical Group, Primary Care',
    OwnerId = UserInfo.getUserId()
));

insert events;
System.debug('Created ' + events.size() + ' events');

// ============ Step 4: Create Cases ============
List<Case> cases = new List<Case>();

cases.add(new Case(
    AccountId = accountId,
    Subject = 'Diabetic Eye Exam - Care Gap',
    Description = 'Annual diabetic retinopathy screening is 3 months overdue. HEDIS measure at risk.',
    Status = 'New',
    Priority = 'High',
    Origin = 'Care Gap Identification',
    OwnerId = UserInfo.getUserId()
));

cases.add(new Case(
    AccountId = accountId,
    Subject = 'Benefits Inquiry - Lab Coverage',
    Description = 'Member has questions about coverage for recent lab work. EOB received.',
    Status = 'Working',
    Priority = 'Medium',
    Origin = 'Phone',
    OwnerId = UserInfo.getUserId()
));

cases.add(new Case(
    AccountId = accountId,
    Subject = 'SDOH - Food Insecurity Identified',
    Description = 'Member mentioned difficulty affording fresh vegetables. Needs community resource connection.',
    Status = 'Working',
    Priority = 'High',
    Origin = 'SDOH Assessment',
    OwnerId = UserInfo.getUserId()
));

insert cases;
System.debug('Created ' + cases.size() + ' cases');

// ============ Step 5: Try Health Cloud Objects ============

// Try to create CarePlan (if available)
try {
    SObject carePlan = Schema.getGlobalDescribe().get('CarePlan').newSObject();
    carePlan.put('Name', 'Chronic Care Management - Maria Santos');
    carePlan.put('AccountId', accountId);
    carePlan.put('Status', 'Active');
    carePlan.put('StartDate', Date.today().addMonths(-6));
    carePlan.put('EndDate', Date.today().addMonths(6));
    carePlan.put('Description', 'Comprehensive chronic care management for Type 2 Diabetes and Hypertension');
    insert carePlan;
    System.debug('Created CarePlan: ' + carePlan.Id);
} catch (Exception e) {
    System.debug('CarePlan not available: ' + e.getMessage());
}

// ============ Summary ============
System.debug('======================================');
System.debug('AHIS Demo Data Creation Complete!');
System.debug('======================================');
System.debug('Account: ' + memberName + ' (ID: ' + accountId + ')');
System.debug('Tasks created: ' + tasks.size());
System.debug('Events created: ' + events.size());
System.debug('Cases created: ' + cases.size());
System.debug('');
System.debug('Next steps:');
System.debug('1. Go to Setup > Object Manager > Account > Lightning Record Pages');
System.debug('2. Edit the Account record page');
System.debug('3. Add "AHIS V3 - Health Intelligence (Persona Demo)" component');
System.debug('4. Navigate to the Maria Santos account record');
System.debug('5. Use the persona dropdown to switch between views');
