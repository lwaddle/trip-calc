# Specifications

## Overview
This app is a lightweight, single-page trip-cost calculator for private jet travel. When the page loads, the user is presented with a worksheet-style interface containing form fields that update the trip estimate in real time.

The app consists of:

- A main page: **index.html**
- A **Defaults** page for configuring persistent default values
- Optional user authentication for saving/loading estimates
- A real-time calculated **Trip Estimate** section
- A PDF export feature for generating a downloadable trip summary

---

## Layout & Navigation

### Header
- Full-width header bar with content constrained to a consistent max-width (standard desktop width).
- **Left:** display `logo.svg`.
- **Right:** a dropdown menu.  
  - **Desktop:** normal dropdown  
  - **Mobile:** hamburger menu
- Dropdown menu items (when signed in):
  - Username (email)
  - **Estimates**
  - **Defaults**
  - **Sign Out**
- If **not** signed in, hide **Estimates**, **Defaults**, and **Sign Out**.

### Title
Below the header, display:

```
<h1>Trip Cost Calculator</h1>
```

---

## Sections

### 1. Flight Legs (`<h2>Flight Legs</h2>`)
A dynamic list of flight legs entered by the user.

Each **tripLeg** contains:

- **From:** text
- **To:** text
- **HH:** integer hours (≥ 0)
- **MM:** integer minutes (0–59)
- **Fuel Burn:** positive integer (lbs)

Notes:

- HH + MM combine into a computed `flightTime` in `HH:MM` format.
- Provide an **Add Leg** button to append an empty leg row.
- Each leg row includes:
  - Label: “Leg 1”, “Leg 2”, etc.
  - A **Delete Leg** button.
- Mobile: use numeric keypads for HH, MM, and fuelBurn.
- App must compute:
  - Total flight time (sum of all legs, properly normalizing minutes)
  - Total fuel burn (lbs → gallons)
- Initial fuel density default: **6.7 lbs per gallon**.

---

### 2. Crew Day Rates (`<h2>Crew Day Rates</h2>`)
Dynamic list of crew entries.

Defaults on load:

- **Crew Member 1**
- **Crew Member 2**

Each crew entry contains:

- **Role:** dropdown (“Pilot”, “Flight Attendant”)
- **Daily Rate:** positive dollar amount

Other rules:

- Default daily rates come from the Defaults page.
- **Add Role** button appends another crew member.
- Each member includes a **Delete** button.
- Mobile: numeric/decimal keypad.

---

### 3. Crew Expenses (`<h2>Crew Expenses</h2>`)

#### 3.1 Trip Duration
- **Trip Days:** positive integer
- **Hotel Stays (nights):** positive integer  
  Defaults: both start at `0`.

#### 3.2 Per Person Expenses
- **Hotel ($/night/person)**
- **Meals ($/day/person)**
- **Other ($/day/person)**  
All must be positive dollar amounts.

#### 3.3 Total Trip Expenses
- **Rental Car ($)**
- **Airfare ($)**
- **Mileage ($)**  
All positive dollar amounts.

Mobile: numeric or decimal keypad.

---

### 4. Hourly Programs & Reserves (`<h2>Hourly Programs & Reserves</h2>`)
Fields:

- **Maintenance Programs ($/hour)**
- **Other Consumables ($/hour)**
- **Additional ($/hour)**

All fields validated as positive dollar amounts.

---

### 5. Airport & Ground Costs (`<h2>Airport & Ground Costs</h2>`)
Fields (all positive dollar amounts):

- Landing Fees  
- Catering  
- Handling  
- Passenger Ground Transport  
- Facility Fees  
- Special Event Fees  
- Ramp/Parking  
- Customs  
- Hangar  
- Other  

Mobile: decimal keypad.

---

### 6. Miscellaneous (`<h2>Miscellaneous</h2>`)
Fields (positive dollar amounts):

- **Trip Coordination Fee ($)**
- **Other ($)**

---

### 7. Trip Notes (`<h2>Trip Notes</h2>`)
One large textarea with placeholder:

> Optional notes about the trip (e.g., client preferences, special handling, overnight particulars)

---

### 8. Trip Estimate (`<h2>Trip Estimate</h2>`)
A `<pre>` block displaying the calculated trip summary.

Example format:

```
LEGS SUMMARY
Leg 1: Aurora - Elko 1h 12m (306 gallons)
Leg 2: Elko - Las Vegas 1h 15m (325 gallons)
Leg 3: Las Vegas - Aurora 1h 58m (597 gallons)

Total Flight Time: 4h 25m
Total Fuel Used: 1228 gallons

ESTIMATE
Pilot 3 day(s) @ $1,500.00
Pilot 3 day(s) @ $1,500.00
Crew Day Rate Subtotal: $9,000.00
Crew Expenses:
  Hotel: $800.00 (2 crew × 2 night(s) × $200.00)
  Meals: $600.00 (2 crew × 3 day(s) × $100.00)
  Rental Car: $200.00
  Mileage: $100.00
Crew Subtotal: $10,700.00

Hourly Subtotal (Programs & Reserves): $4,630.52
  Maintenance Programs: $4,630.52 (4.42 hrs × $1,048.42)
Fuel Subtotal: $7,279.74
  (1228 gallons @ $5.93)
Airport & Ground Subtotal: $2,475.00
  Landing Fees: $100.00
  Catering: $300.00
  Handling: $375.00
  Facility Fees: $800.00
  Ramp/Parking: $900.00
Miscellaneous Subtotal: $150.00
  Trip Coordination Fee: $150.00

Estimated Total: $25,235.26

Trip Notes:
Sally is gluten free.
```

Values update in real time based on all page inputs.

---

## Footer Buttons
At the bottom of the page include:

- **Copy to Clipboard**
- **Export to PDF**
- **Save Estimate** (signed-in only)
- **Load Estimate** (signed-in only)
- **Reset**

---

## PDF Export Integration

The **Export to PDF** button must generate a downloadable PDF version of the *Trip Estimate* section.

### Requirements:
- Use a client-side JavaScript PDF library (recommended: **jsPDF**, **pdf-lib**, or **html2pdf.js**).
- Export only the `Trip Estimate` section, not the entire page.
- PDF formatting should preserve:
  - Monospaced formatting (like the `<pre>` block)
  - Line breaks
  - Indentation structure
  - Section header styling (simple, bold text)
- The downloaded file name should follow:
  `trip-estimate-YYYYMMDD-HHMM.pdf`

---

## Defaults Page
A separate page for setting global default values:

- Fuel price
- Fuel density (lbs/gal)
- Pilot daily rate
- Flight attendant daily rate
- Hotel ($/night/person)
- Meals ($/day/person)
- Maintenance Programs ($/hour)

Defaults should persist:
- Anonymous users → localStorage  
- Signed-in users → Firestore

---

## Authentication & Hosting

### Authentication
- Only a few trusted users will have sign-in access.
- Anonymous users:
  - Full calculator functionality
  - Cannot save/load estimates
- Signed-in users:
  - Can save and load estimates

**Planning to use:** Supabase Authentication 
- Email/password sign-in  

### Storage Options
- Postgres Database

### Hosting
Cloudflare Pages