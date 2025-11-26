# Major Change - Replace Defaults with Profile Feature

## Description

I think the current 'Defaults' feature is unnecessary. Remove it from the header and update the schema as needed. I'm thinking instead of the current defaults, I want a profile feature that's part of the actual trip cost calculator workflow when creating a new estimate (before it is saved). After the estimate is saved, I don't want the profile feature section to show anymore on that particular estimate--the user would just edit the values directly.

There would be standard profiles as well as an option for custom profiles (for authenticated users). We will need a new section at the very top of the Trip Cost Calculator titled 'Profile'. It will go below the h1 and above the first section titled 'Flight Legs'. It contains a dropdown with a list of profiles

**Standard profiles would be:**

- Jet - Large
- Jet - Medium
- Jet - Small
- Turboprop - Twin
- Turboprop - Single

Next to the dropdown, there will be a button. For users that are signed in, the button would say, 'New Profile'. Guest users would see a message instead of the button. It would say, 'Sign in to create a profile'. The phrase, 'Sign in' would be a link to a sign in modal. Once they sign in, direct to the view for editing profiles. For guest users and until a signed in user changes their preference, make 'Jet - Medium' the default profile. Whichever profile is selected as default should always appear as the current selected and displayed item in the dropdown list.

Authenticated users need to be able to add, update, and delete their custom profiles as well as select which profile is their default. There will need to be a 'Profiles' view that allows users to manage profiles. A profile will is basically an object that contains properties that are used to prefill many of the fields on the trip calculator when a new estimate is created. A profile should contain the following properties:

**Profile properties**

- Name
- Fuel Price ($/gallon)
- Fuel Density (lbs/gallon)
- Pilots Required
- Pilot Daily Rate ($)
- Flight Attendants Required
- Flight Attendant Daily Rate ($)
- Hotel ($/night/person)
- Meals ($/day/person)
- Maintenance Programs ($/hour)
- APU Burn (lbs/leg)
- Make Default?

Note: Make 'Name', 'Fuel Price', 'Fuel Density', 'Pilots Required', and 'Flight Attendants Required' required. Set 'Fuel Density' to 6.7 initially. 'Make Default' is a boolean checkbox. If checked, it will be the default profile used when creating any new estimates in the calculator. Any values that are left empty by the user should be set to 0 on save.

I will need to create initial values for the standard profiles. See 'Standard Profiles Initial Values' section below.

## New Behavior for Current Calculator Page

## Profile Section

The 'Profile' section will go below the h1 and above the first section titled 'Flight Legs'. This section is described in detail above in 'Description'. It contains a dropdown with a list of profiles. The user's custom profiles should appear at the top of the list in alphabetical order, followed by the built in standard profiles in sorted as they are above. A guest user's profile list will only contain the standard profiles above listed in the order above.

The entire 'Profile' section is conditional. It only appears when a new estimate is started and remains visible until the estimate is saved. This means it will always be visible to a guest. Once the estimate is saved, remove the 'Profile' section. the user will make edits directly to the fields at that point.

### Crew Day Rates Section

Nothing really changes on the trip calculator--only some of its default values. Values will preload based on which profile is selected. The default profile will initially be the profile that fills the associated fields. One noticible change is how the page initially displays the 'Crew Day Rates' section. Right now, it defaults to including 2 pilots at $1500/day each. This section will now initially load based on what is in the profile used. For example, if the page is being displayed for a guest, the 'Jet - Medium' profile is default, so 2 pilots will be included by default and their rate will be derived from the 'Jet - Medium' profile. If the user selects a different profile, update the 'Crew Day Rates' section presentation as needed. For example, if they select 'Jet - Large', populate 3 total roles; 2 pilots and 1 flight attendant (as derived from the 'Jet - Large' profile) and their rates.

### Crew Expenses Section

We've been using hard coded default values here for 'Hotel ($/night/person)' and 'Meals ($/day/person)'. Change that and start using the associated values derived from the selected profile.

## Header Items and Mobile Menu

Remove 'Defaults' from the header. Add 'Profiles' to the user's dropdown menu. 'Profile' links to the view for editing profiles. Leave 'Estimates' as is.

## Profiles View

The profiles view contains a list of all profiles. Add a label at the top that says, 'Profiles'. There should be a clearly identified '+' button for adding a new profile. When the '+' button is pressed, display a view to create a new view and present all the fields that make up a profile object. Add appropriate 'Cancel' and 'Save' buttons. Each custom user profile should contain an 'Edit' button. When the 'Edit' button is pressed, display a view that allows the profile to be updated. Include 'Update' and 'Cancel' buttons. 

## Standard Profiles Initial Values

### Jet - Large

- Name: Jet - Large
- Fuel Price ($/gallon): 6.00
- Fuel Density (lbs/gallon): 6.7
- Pilots Required: 2
- Pilot Daily Rate ($): 2500.00
- Flight Attendants Required: 1
- Flight Attendant Daily Rate ($): 1000.00
- Hotel ($/night/person): 300.00
- Meals ($/day/person): 150.00
- Maintenance Programs ($/hour): 1800.00
- APU Burn (lbs/leg): 225

### Jet - Medium

- Name: Jet - Medium
- Fuel Price ($/gallon): 6.00
- Fuel Density (lbs/gallon): 6.7
- Pilots Required: 2
- Pilot Daily Rate ($): 1600.00
- Flight Attendants Required: 0
- Flight Attendant Daily Rate ($): 800.00
- Hotel ($/night/person): 250.00
- Meals ($/day/person): 100.00
- Maintenance Programs ($/hour): 1100.00
- APU Burn (lbs/leg): 120

### Jet - Small

- Name: Jet - Small
- Fuel Price ($/gallon): 6.00
- Fuel Density (lbs/gallon): 6.7
- Pilots Required: 1
- Pilot Daily Rate ($): 1300.00
- Flight Attendants Required: 0
- Flight Attendant Daily Rate ($): 500.00
- Hotel ($/night/person): 250.00
- Meals ($/day/person): 100.00
- Maintenance Programs ($/hour): 800.00
- APU Burn (lbs/leg): 0

### Turboprop - Twin

- Name: Turboprop - Twin
- Fuel Price ($/gallon): 6.00
- Fuel Density (lbs/gallon): 6.7
- Pilots Required: 1
- Pilot Daily Rate ($): 1000.00
- Flight Attendants Required: 0
- Flight Attendant Daily Rate ($): 500.00
- Hotel ($/night/person): 250.00
- Meals ($/day/person): 100.00
- Maintenance Programs ($/hour): 800.00
- APU Burn (lbs/leg): 0

### Turboprop - Single

- Name: Turboprop - Single
- Fuel Price ($/gallon): 6.00
- Fuel Density (lbs/gallon): 6.7
- Pilots Required: 1
- Pilot Daily Rate ($): 1000.00
- Flight Attendants Required: 0
- Flight Attendant Daily Rate ($): 500.00
- Hotel ($/night/person): 250.00
- Meals ($/day/person): 100.00
- Maintenance Programs ($/hour): 500.00
- APU Burn (lbs/leg): 0

## Database Requirements

I need you to figure out the best way to implement this big change into our current architechture.