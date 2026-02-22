Home screen layout (desktop)
Top header
    •    Hospital name and unit selector dropdown, like ICU North, Oncology Infusion, ED, Radiology
    •    Search bar that accepts patient name, MRN, bed number, pod ID, patch ID
    •    “Live” indicator with last data timestamp, plus network status icon
    •    Button for “Create report” visible to leadership roles only
Main content area: three vertical zones
Zone 1: Alert queue (left column, always visible)
This is the SafeLock-style “critical list” equivalent. It is the first thing the eye lands on.
    •    Alerts are stacked cards, newest first
    •    Each card includes:
    ◦    Bed number and patient initials or anonymized ID depending on policy
    ◦    IV site location, like left forearm, right AC, hand
    ◦    Alert severity label, such as “High likelihood infiltration pattern,” “Moderate likelihood,” “Sensor issue”
    ◦    Time since alert started, like 6 minutes
    ◦    A one-line recommended action, like “Pause infusion and assess site”
    ◦    Buttons: “Acknowledge,” “Escalate,” “Mark resolved,” “Snooze 5 min”
    •    When acknowledged, the card shrinks and shows who acknowledged it and when
    •    If not acknowledged within a configurable time window, it automatically escalates to the charge nurse list and can trigger nurse call integration if enabled
Zone 2: Unit map and status (center column)
A bed grid shows every bed in the unit as a tile.
    •    Each bed tile includes:
    ◦    Bed number
    ◦    VeinCheck status icon, such as Monitoring active, No device, Offline, Alert present
    ◦    A tiny “site count” if more than one IV site is monitored
    ◦    A timer showing how long monitoring has been active since placement
    •    Tiles are color-coded by state. High alert is the most visually prominent. Moderate alert is distinct. Normal is neutral. Offline is gray.
Clicking a bed tile opens the patient detail drawer on the right.
Zone 3: Key metrics strip (right column top, above patient details)
This is a compact summary for leadership and charge nurses:
    •    Active monitored IV sites on the unit right now
    •    Alerts in the last hour
    •    Median time to acknowledgement today
    •    Median time from alert to “resolved” today
    •    False alert review queue count, which is only for QA roles

Patient detail view (right-side drawer or full page)
When a bed is selected, a patient detail panel slides out.
Header
    •    Bed number, patient ID, MRN if permitted
    •    IV site label and insertion timestamp
    •    Infusion type field if integrated, like fluids, antibiotics, contrast, or unknown
    •    “Device attached” line showing patch ID and pod ID with a small “tap to copy” function for tracking
    •    Battery percent for pod plus an estimated hours remaining value
Live status block
This is a high-signal, low-text card:
    •    Current risk state: Normal, Watch, Alert
    •    Confidence meter, like low to high, that reflects algorithm certainty
    •    Data quality indicator, such as Good contact, Weak contact, Motion artifact detected
    •    “Last stable baseline” timestamp
Trend charts
Two charts, stacked, with the same time axis and a thin vertical marker for when the alert triggered.
    1    Temperature trend chart
    •    Shows relative temperature deviation from baseline, not absolute temperature
    •    Highlights slope changes and sustained cooling patterns
    •    Includes a shaded “expected normal variability band”
    2    Tissue thickness proxy trend chart
    •    Shows relative change from baseline
    •    Highlights sustained swelling pattern
    •    Marks periods where signal quality drops due to contact loss
Both charts support pinch-zoom and quick time windows, like last 15 minutes, last hour, full session.
Event log timeline
A scrollable timeline that feels like an audit trail:
    •    Device attached
    •    Baseline established
    •    Alert triggered
    •    Nurse acknowledged
    •    Action recorded, like paused infusion, assessed site, replaced IV
    •    Alert resolved or escalated
    •    Notes added
Every event logs user, timestamp, and device ID.
Action panel
A structured checklist that reduces cognitive load:
    •    Step 1: Assess site, check for swelling, blanching, pain
    •    Step 2: Follow unit protocol, pause infusion if indicated
    •    Step 3: Document outcome in EHR, with a one-click “copy note” template
If EHR integration is enabled, the panel can push a structured note or populate a flowsheet entry.

Device and inventory module (for biomed and unit managers)
A separate tab, “Devices,” shows:
    •    Pods in circulation by unit
    •    Pods in storage
    •    Pods needing charge
    •    Pods flagged for maintenance
    •    Pods with repeated connectivity issues
    •    Patch inventory levels with predicted runout dates
Each pod has a detail page:
    •    Pod ID and firmware version
    •    Last calibration check
    •    Battery health, cycle count if available
    •    Connection history, including dropouts
    •    Error codes with recommended fixes
    •    Assignment history by bed and unit for traceability

Analytics module (for leadership and quality)
This is where you match the SafeLock style “projection and validation” story, but for clinical operations.
Core dashboards
    •    Alerts per 100 monitored IV hours, trended weekly
    •    Time to acknowledgement distribution
    •    Time from alert to intervention distribution
    •    Repeat alerts by site location
    •    Alerts by infusion category, if available
    •    Unacknowledged alerts count over time, used to identify workflow breakdown
Outcomes and review
A “case review” workflow:
    •    Filters for high-severity alerts, prolonged alerts, or repeated alerts
    •    Side-by-side view of sensor trends and nurse documentation
    •    “Label as true infiltration,” “label as false alert,” “unclear” buttons
    •    Exportable dataset for internal QI
This module supports a hospital’s need for defensibility and continuous improvement.

Integrations and privacy controls
Integration points
    •    Nurse call systems, optional, for escalation
    •    EHR integration using a structured note template or flowsheet entries
    •    Bed management systems for bed-to-patient mapping
    •    Hospital paging for critical escalations
Privacy controls
    •    Patient identifiers can be hidden at the unit board level and only shown after role-based access
    •    Audit logging is enabled for every view and action
    •    Data retention policy is configurable

What the dashboard should feel like, visually
    •    Minimal text
    •    Large status cues
    •    Consistent placement of alert actions
    •    A “single source of truth” feel, where nurses do not have to hunt for the next step
    •    The ability to go from unit-wide view to one patient’s trends in one click