# VeinCheck Command — Demo Data Notes (Prototype v1)

**Purpose:** This project uses **fully synthetic demo data** for UI/UX screenshots and product demos.  
**Not for clinical use.** Do not enter real patient information.

---

## Global demo assumptions

- **Demo date/time (fixed clock default):** 2026-02-22 08:12:34 (local)
- **Hospital:** St. Anne Medical Center
- **Default unit:** ICU North
- **Units available:**
  - ICU North (default)
  - Oncology Infusion
  - Emergency Department
  - Radiology Contrast Suite
- **Identifier policy (demo):**
  - Unit board shows **anonymized IDs** by default.
  - MRN and initials can be revealed only when “Reveal identifiers” is toggled and role permits.

---

## Demo users by role (display names)

Use these exact display names throughout the UI:

- Staff Nurse → **J. Patel, RN**
- Charge Nurse → **E. Flores, RN**
- Leadership → **M. Chen, Director**
- QA Reviewer → **K. Singh, QA**
- Biomed Tech → **A. Romero, Biomed**
- Unit Manager → **T. Wallace, Unit Manager**
- Admin → **System Admin**

---

## ICU North — Alert Queue (exact seed set)

Newest first (top of queue).

1) **A-20260222-0810-B12**
- Bed: 12
- patientAnonId: VC-ICUN-1204
- patientInitials: R.T.
- MRN: 48522137
- Site: Left forearm
- Severity: high
- Label: High likelihood infiltration pattern
- Started: 08:06:21
- Recommended action: Pause infusion and assess site
- Status: active_unacknowledged
- Pod: VC-POD-0417
- Patch: VC-PATCH-12-02

2) **A-20260222-0807-B04**
- Bed: 4
- patientAnonId: VC-ICUN-0402
- patientInitials: L.M.
- MRN: 48521988
- Site: Right AC
- Severity: moderate
- Label: Moderate likelihood infiltration pattern
- Started: 08:01:58
- Recommended action: Reassess site and compare to baseline
- Status: acknowledged
- Acknowledged by: J. Patel, RN
- Acknowledged at: 08:04:11

3) **A-20260222-0805-B18**
- Bed: 18
- patientAnonId: VC-ICUN-1811
- patientInitials: S.K.
- MRN: 48522309
- Site: Left hand
- Severity: sensor_issue
- Label: Sensor issue
- Started: 08:00:42
- Recommended action: Check patch contact and pod connection
- Status: active_unacknowledged

4) **A-20260222-0758-B07**
- Bed: 7
- patientAnonId: VC-ICUN-0703
- patientInitials: M.B.
- MRN: 48521743
- Site: Right forearm
- Severity: high
- Label: High likelihood infiltration pattern
- Started: 07:49:03
- Recommended action: Pause infusion and assess site immediately
- Status: escalated
- Escalated at: 07:56:15
- Escalated to: Charge Nurse
- nurseCallTriggered: true

5) **A-20260222-0752-B21**
- Bed: 21
- patientAnonId: VC-ICUN-2105
- patientInitials: N.G.
- MRN: 48522491
- Site: Left wrist
- Severity: moderate
- Label: Moderate likelihood infiltration pattern
- Started: 07:41:27
- Recommended action: Inspect site and verify line patency
- Status: snoozed
- Snoozed until: 08:11:27

6) **A-20260222-0749-B03**
- Bed: 3
- patientAnonId: VC-ICUN-0301
- patientInitials: D.H.
- MRN: 48521612
- Site: Right hand
- Severity: sensor_issue
- Label: Sensor issue
- Started: 07:35:12
- Recommended action: Re-seat pod and confirm contact
- Status: acknowledged
- Acknowledged by: Charge RN E. Flores
- Acknowledged at: 07:37:02

---

## ICU North — Bed Grid (24 beds, exact states)

- Bed 1: monitoring_active, sites=1, duration=1h 52m
- Bed 2: no_device
- Bed 3: sensor_issue_alert, sites=1, duration=3h 18m
- Bed 4: moderate_alert, sites=1, duration=2h 06m
- Bed 5: monitoring_active, sites=2, duration=4h 11m
- Bed 6: monitoring_active, sites=1, duration=0h 42m
- Bed 7: high_alert_escalated, sites=1, duration=5h 33m
- Bed 8: offline, sites=1, duration=— (offline)
- Bed 9: monitoring_active, sites=1, duration=1h 09m
- Bed 10: no_device
- Bed 11: monitoring_active, sites=1, duration=7h 26m
- Bed 12: high_alert_active (default selected), sites=1, duration=3h 54m
- Bed 13: monitoring_active, sites=2, duration=6h 02m
- Bed 14: monitoring_active, sites=1, duration=0h 31m
- Bed 15: no_device
- Bed 16: monitoring_active, sites=1, duration=8h 12m
- Bed 17: monitoring_active, sites=1, duration=2h 47m
- Bed 18: sensor_issue_alert, sites=1, duration=1h 18m
- Bed 19: monitoring_active, sites=1, duration=4h 56m
- Bed 20: monitoring_active, sites=1, duration=0h 58m
- Bed 21: moderate_alert_snoozed, sites=1, duration=2h 29m
- Bed 22: no_device
- Bed 23: monitoring_active, sites=1, duration=3h 44m
- Bed 24: offline, sites=1, duration=— (offline)

---

## ICU North — Key Metrics (right rail top)

Use these exact values for the ICU North snapshot:

- Active monitored IV sites now: **19**
- Alerts in last hour: **6**
- Median time to acknowledgement today: **2m 14s**
- Median time alert → resolved today: **11m 42s**
- False alert review queue: **7** *(only for QA/Leadership/Admin)*

Additional (secondary) tiles:
- Last 24h monitored IV hours: **187.6**
- Current online pods: **18 / 20**
- Contact quality good: **84%**
- Unacknowledged >5 min: **2**

---

## Patient Detail — Bed 12 (full fidelity)

### Header fields (exact)
- Bed: 12
- Patient anonymized ID: VC-ICUN-1204
- Patient initials (if revealed): R.T.
- MRN (if revealed): 48522137
- IV site label: Left forearm, PIV 20G
- Insertion timestamp: 2026-02-22 04:18
- Infusion type: Antibiotics (Vancomycin)
- Patch ID: VC-PATCH-12-02
- Pod ID: VC-POD-0417
- Battery: 62%
- Estimated hours remaining: 7.8h
- Firmware: v1.9.3

### Live status block (exact)
- Risk state: ALERT
- Confidence: 0.87 (High)
- Data quality: Good contact
- Last stable baseline: 04:26
- Contact quality (last 15m): 92%
- Motion artifact: None in last 10m

### Trend data (1-hour view, 5-min intervals; 07:15–08:15)
Fields per point:
- time
- tempDeltaC
- thicknessDeltaPct
- quality (good/weak)
- motionArtifact (true/false)
- normalBandLow, normalBandHigh (use -0.20 / +0.20)

Data points:
- 07:15  temp +0.02, thick +0.3,  quality good, motion false, band [-0.20, +0.20]
- 07:20  temp -0.01, thick +0.4,  good, false
- 07:25  temp +0.03, thick +0.6,  good, false
- 07:30  temp -0.04, thick +0.9,  good, false
- 07:35  temp -0.08, thick +1.4,  good, false
- 07:40  temp -0.12, thick +2.1,  good, false
- 07:45  temp -0.18, thick +3.0,  good, false
- 07:50  temp -0.26, thick +4.4,  good, false
- 07:55  temp -0.37, thick +6.2,  good, false
- 08:00  temp -0.51, thick +8.1,  good, false
- 08:05  temp -0.68, thick +10.2, good, false
- 08:10  temp -0.86, thick +12.1, weak, true  **(alert trigger ≈ 08:06)**
- 08:15  temp -0.95, thick +13.0, good, false

Full session extension guidance (for “Full session” window):
- Session starts around 04:20.
- Mostly stable baseline until the final ~40 minutes.
- Include a short contact loss period: 05:53–05:56 (quality weak).

### Bed 12 event timeline (exact seed events)
- 04:19  System        Device attached                     Pod VC-POD-0417, Patch VC-PATCH-12-02
- 04:26  System        Baseline established                Contact quality good
- 05:53  System        Contact quality drop detected       Weak contact (temporary)
- 05:56  System        Contact restored                    Contact quality good
- 08:06  System        Alert triggered                     High likelihood infiltration pattern
- 08:07  Charge RN E. Flores  Alert surfaced on unit board Queue priority high
After UI actions, append events:
- acknowledged
- escalated
- resolved
- notes added

### Copy note template (exact string)
“VeinCheck alert reviewed for Bed 12 left forearm IV site. Site assessed for swelling/blanching/pain/coolness. Infusion status and site findings documented per unit protocol. Device Pod VC-POD-0417 / Patch VC-PATCH-12-02.”

---

## Additional patient seeds (minimum detail)

Provide summary patient objects for beds:
- 3 (sensor issue)
- 4 (moderate alert acknowledged)
- 7 (high alert escalated)
- 18 (sensor issue)
- 21 (moderate alert snoozed)

Each should have:
- unique IV site location
- plausible infusion type (or Unknown)
- pod/patch IDs
- battery %
- short timeline (3–6 events)
- short trend traces (generated) consistent with their status

---

## Devices module — summary cards (exact)

Top summary cards:
- Pods in circulation (unit): **58**
- Pods in storage: **22**
- Pods needing charge: **9**
- Pods flagged for maintenance: **3**
- Pods with repeated connectivity issues (7d): **4**
- Patch inventory on hand: **416**
- Predicted patch runout date (ICU North): **2026-03-03**

### Pod detail seed (exact): VC-POD-0417
- Pod ID: VC-POD-0417
- Firmware: v1.9.3
- Hardware rev: H2
- Last calibration check: 2026-02-15 13:20 (Pass)
- Battery health: 91%
- Estimated cycle count: 184
- Current assignment: ICU North Bed 12
- Patch paired: VC-PATCH-12-02
- Connection history (last 24h):
  - 05:53 dropout 3m (weak contact)
  - 05:56 restored
  - otherwise stable
- Error codes:
  - E112 Weak contact (informational)
  - No critical errors
- Recommended fixes:
  - Re-seat patch
  - Inspect adhesive edge
  - Verify pod latch
- Assignment history: include at least 8 rows (unit, bed, start/end, outcome)

### Patch inventory by type (seed values)
- Adult forearm patch: 220 (runout 9 days)
- Adult hand/wrist patch: 128 (runout 7 days)
- Pediatric small patch: 68 (runout 14 days)

---

## Analytics module — seed values (exact)

KPI cards:
- Total monitored IV hours (period): **12,486**
- Total alerts: **251**
- Alerts / 100 monitored IV hours: **2.01**
- Median acknowledge time: **2m 23s**
- Median alert → intervention: **10m 58s**
- Labeled false alerts: **41**
- Labeled true infiltrations: **137**
- Unclear review cases: **19**
- Review completion rate: **78%**

Charts:
1) Alerts per 100 monitored IV hours (weekly, 12w ICU North):
[2.4, 2.1, 2.2, 2.0, 1.9, 2.3, 2.5, 2.2, 2.0, 1.8, 2.1, 2.0]

2) Time to acknowledgement distribution (counts):
- 0–1m: 31
- 1–2m: 46
- 2–5m: 58
- 5–10m: 19
- 10m+: 7

3) Time alert → intervention distribution (counts):
- 0–5m: 22
- 5–10m: 49
- 10–20m: 61
- 20–30m: 18
- 30m+: 4

4) Repeat alerts by site location (counts):
- Left forearm 18
- Right forearm 14
- Left hand 11
- Right AC 9
- Wrist 7
- Other 5

5) Alerts by infusion category:
- Fluids 34%
- Antibiotics 27%
- Contrast 16%
- Vasopressors 8%
- Blood products 5%
- Unknown 10%

6) Unacknowledged alerts over time:
- Provide a time-series with small peaks around shift change.
- Annotate 07:00 shift change and 19:00 shift change.

Case Review:
- Seed at least 8 cases with variation.
- Include one case tied to Bed 12, initial label “unlabeled”.

---

## Alternate unit datasets (believable variations)

Oncology Infusion:
- Higher monitoring coverage, fewer high alerts, more antibiotics.
ED:
- More no-device/offline, faster turnover, shorter sessions.
Radiology Contrast Suite:
- Contrast-specific infusion categories, short monitoring sessions around imaging.

Each unit should have:
- 12–24 beds depending on unit
- 3–6 alerts in queue
- coherent metrics matching the unit context

---

## Demo disclaimers

- Use a small badge somewhere: **“Demo data / not for clinical use.”**
- All IDs are synthetic.
- No clinical diagnosis claims; use language like “likelihood pattern” and “sensor issue”.