# Specifications

**Here is a detailed description of the app I want you to help me build:**

The app is a very simple, lightweight calculator to compute an estimated cost of a specific trip in a private jet. When the page loads, the user should be presented with a worksheet of form fields that collect trip specifics and update the output in real time.

I want the main page, index.html, to have a familiar look for the user. The top of the page will have a full width header with its content restrictd to a standard desktop max width. The same max-width will be used throughout the site. In the header, my logo (logo.svg) will be positioned at the left. At the right side of the header, I want a dropdown menu. Eventually it will contain the signed in user's username (just their email address), a link to 'Estimates', a link to 'Defaults' (a pager where the user can configure default values), and a sign out link. In mobile mode, the drop down will be one of those classic 3 bar (hamburger) style buttons.

Below the header, there will be an h1 that says, 'Trip Cost Calculator'. The h1 will be followed by multiple sections. The first section is titled with an h2, 'Flight Legs'. This section is where the user enters in the legs of a trip. It needs the following data fields to create a single tripLeg: 'from' (text), 'to' (text), 'flightTime' (see note), and 'fuelBurn' (int). Note... flightTime should be derived from the user filling out two fields, 'HH' and 'MM'. Those can be used to make a flight time in the format HH:MM. choose whatever variable naming convention that works best. The user should be able to add multiple legs, so place an 'Add Leg' button somewhere conveinient. When the user pushes the add leg button, create a new row at the bottom with a blank leg. There also needs to be a way to delete a leg, so place a 'Delete Leg' button somewhere too. Each leg should have a label like, 'Leg 1', 'Leg 2', etc. There needs to be some data validation on the fields. hours must be positive, minutes must be positive and not exceed 59. In mobile, utilize a numberpad instead of an alphanumeric keyboard--same for the fuelBurn field. The purpose of this section is to collect data to calculate total flight time and total fuel burn. Total fuel burn is calcuated in pounds, but the final output on the summary will be in gallons. The fuel density for the conversion will come from the defaults page and will initially be set to 6.7 pounds per gallon.

The next section is titled 'Crew Day Rates'. This section is similar to the 'Flight Legs' section in that it is dynamic. When the page loads, it will default to having two crew members loaded--'Crew Member 1' and 'Crew Member 2'. A crew member has two properties--'role' and 'dailyRate'. For the UI, I want the user to be able to select a crew member role from a dropdown. The options will be 'Pilot' or 'Flight Attendant'. Their dailyRate will be a dollar amount that can be modified by the user. Default amounts for a pilot and flight attendant can be configured in the defaults page. I would like a button to 'Add Role' where the user can add additional crew members. Each crew member should also have a 'Delete' button to remove that crew member. Apply validation to the dailyRate form field that only allows positive dollar amounts. In mobile view, the keypad displayed should be appropriate--decimal point and numbers only.

The next section is titled, 'Crew Expenses'. It has multiple sub-sections. The first sub-section is labeld, 'Trip Duration'. In this sub-section, I need two fields--'Trip Days' and 'Hotel Stays (nights)'. Data validation should only allow positive integers. For mobile, the keypad should be numeric. These fields will both default to 0 initially.

The next sub-section is labled, 'Per Person Expenses'. This subsection needs the following three fields: 'Hotel ($/night/person)', 'Meals ($/day/person)', and 'Other ($/day/person)'. For data validation, ensure these fields are all positive dollar amounts. In mobile, present the user with a decimal keypad.

The next sub-section is labeld, 'Total Trip Expenses'. The sub-section needs the following 3 fields: 'Rental Car ($)', 'Airfare ($)', and 'Mileage ($)'. Data validation--only positive dollar amounts. In mobile, present a decimal keypad.

The next h2 secions is labeled, 'Hourly Programs & Reserves'. This section contains the following 3 fields: 'Maintenance Programs ($/hour)', 'Other Consumables ($/hour)', and 'Additional ($/hour)'. Validate these fields to only allow positive dollar amounts. Present the user a decimal pad in mobile view

The next h2 section is labeled, 'Airport & Ground Costs'. It contains the following fields: 'Landing Fees ($)', 'Catering ($)', 'Handling ($)', 'Passenger Ground Transport ($)', 'Facility Fees ($)', 'Special Event Fees ($)', 'Ramp/Parking ($)', 'Customs ($)', 'Hangar ($)', and 'Other ($)'. Apply data validation to ensure these are all positive dollar amounts. In mobile view, present the user with a decimal pad.

The next h2 section is labeled, 'Miscellaneous'. It contains 2 fields: 'Trip Coordination Fee ($)', and 'Other ($)'. Apply data validation to ensure these are all positive dollar amounts. In mobile view, present the user with a decimal pad.

The next h2 section is labeled, 'Trip Notes'. It contains one big textarea with the following placeholder text: 'Optional notes about the trip (e.g., client preferences, special handling, overnight particulars)'. The user can enter any misc notes here that will be attached to the summary.

The last h2 section is labeled, 'Trip Estimate'. This section contains a pre element that presents an estimate of the trip. The text in this element should look something like this:

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

This is just an example. The actual output we be calculated based on the values from all the fields in the page.

I want the following buttons at the bottom of the page: 'Copy to Clipboard', 'Export to PDF', 'Save Estimate', 'Load Estimate', and 'Reset'. If the user is not signed in, don't display options to save or load estimates.

Let me explain a little about the 'Defaults' page. I was thinking this could be a separate page that is used to store defaults values for things like fuel price, fuel density, pilot daily rate, flight attendant daily rate, Hotel ($/night/person), Meals ($/day/person), and Maintenance Programs ($/hour).

I'm thinking I want to use something like Firebase to handle authentication, but I will need you to help me determine what I need. This app will only be used by a few people that I will give access. Annonomous users will be allowed to use the basic functions, but they won't be able to load or save estimates. Signed in users will get to save and load estimates. Help me determine best way to host. I was thinking Cloudflare Pages because it's so simple.