// ===========================
// Standard Profiles
// ===========================
export const STANDARD_PROFILES = [
    {
        id: 'jet-large',
        name: 'Jet - Large',
        fuelPrice: 6.00,
        fuelDensity: 6.7,
        pilotsRequired: 2,
        pilotRate: 2500.00,
        attendantsRequired: 1,
        attendantRate: 1000.00,
        hotelRate: 300.00,
        mealsRate: 150.00,
        maintenanceRate: 1800.00,
        apuBurn: 225,
        isStandard: true
    },
    {
        id: 'jet-medium',
        name: 'Jet - Medium',
        fuelPrice: 6.00,
        fuelDensity: 6.7,
        pilotsRequired: 2,
        pilotRate: 1600.00,
        attendantsRequired: 0,
        attendantRate: 800.00,
        hotelRate: 250.00,
        mealsRate: 100.00,
        maintenanceRate: 1100.00,
        apuBurn: 120,
        isStandard: true
    },
    {
        id: 'jet-small',
        name: 'Jet - Small',
        fuelPrice: 6.00,
        fuelDensity: 6.7,
        pilotsRequired: 1,
        pilotRate: 1300.00,
        attendantsRequired: 0,
        attendantRate: 500.00,
        hotelRate: 250.00,
        mealsRate: 100.00,
        maintenanceRate: 800.00,
        apuBurn: 0,
        isStandard: true
    },
    {
        id: 'turboprop-twin',
        name: 'Turboprop - Twin',
        fuelPrice: 6.00,
        fuelDensity: 6.7,
        pilotsRequired: 1,
        pilotRate: 1000.00,
        attendantsRequired: 0,
        attendantRate: 500.00,
        hotelRate: 250.00,
        mealsRate: 100.00,
        maintenanceRate: 800.00,
        apuBurn: 0,
        isStandard: true
    },
    {
        id: 'turboprop-single',
        name: 'Turboprop - Single',
        fuelPrice: 6.00,
        fuelDensity: 6.7,
        pilotsRequired: 1,
        pilotRate: 1000.00,
        attendantsRequired: 0,
        attendantRate: 500.00,
        hotelRate: 250.00,
        mealsRate: 100.00,
        maintenanceRate: 500.00,
        apuBurn: 0,
        isStandard: true
    }
];

export const DEFAULT_PROFILE_ID = 'jet-medium';
