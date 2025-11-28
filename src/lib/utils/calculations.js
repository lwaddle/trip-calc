/**
 * Calculate trip cost estimate from legs, crew, and settings
 * @param {Object} params - Calculation parameters
 * @returns {Object} Complete estimate with all costs and breakdowns
 */
export function calculateEstimate({
    legs = [],
    crew = [],
    fuelDensity = 6.7,
    fuelPrice = 5.93,
    includeAPU = false,
    apuBurn = 100,
    tripDays = 0,
    hotelStays = 0,
    hotelRate = 0,
    mealsRate = 0,
    otherRate = 0,
    rentalCar = 0,
    airfare = 0,
    mileage = 0,
    maintenanceRate = 0,
    consumablesRate = 0,
    additionalRate = 0,
    landingFees = 0,
    catering = 0,
    handling = 0,
    passengerTransport = 0,
    facilityFees = 0,
    specialEventFees = 0,
    rampParking = 0,
    customs = 0,
    hangar = 0,
    otherAirport = 0,
    tripCoordinationFee = 0,
    otherMisc = 0,
    tripNotes = ''
}) {
    // Flight legs calculations
    let totalMinutes = 0;
    let totalFuelLbs = 0;
    let totalAPUFuel = 0;
    let activeLegsCount = 0;
    const legsSummary = [];

    legs.forEach((leg, index) => {
        const hours = leg.hours || 0;
        const minutes = leg.minutes || 0;
        const fuelBurn = leg.fuelBurn || 0;

        totalMinutes += (hours * 60) + minutes;

        // Determine if leg is active (has flight time AND fuel burn)
        const isActiveLeg = ((hours > 0 || minutes > 0) && fuelBurn > 0);

        // Add base fuel burn
        let legFuelTotal = fuelBurn;

        // Add APU burn if checkbox is checked and leg is active
        if (includeAPU && isActiveLeg) {
            legFuelTotal += apuBurn;
            totalAPUFuel += apuBurn;
            activeLegsCount++;
        }

        totalFuelLbs += legFuelTotal;

        const gallons = legFuelTotal / fuelDensity;
        legsSummary.push({
            index: index + 1,
            from: leg.from || '(empty)',
            to: leg.to || '(empty)',
            hours,
            minutes,
            gallons,
            apuIncluded: includeAPU && isActiveLeg
        });
    });

    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;
    const totalFuelGallons = totalFuelLbs / fuelDensity;
    const totalFlightHours = totalMinutes / 60;

    // Crew calculations
    const crewCount = crew.length;
    let crewDayTotal = 0;
    const crewDetails = [];

    crew.forEach(crewMember => {
        const total = crewMember.rate * tripDays;
        crewDayTotal += total;
        crewDetails.push({
            role: crewMember.role,
            days: tripDays,
            rate: crewMember.rate,
            total
        });
    });

    const hotelTotal = crewCount * hotelStays * hotelRate;
    const mealsTotal = crewCount * tripDays * mealsRate;
    const otherTotal = crewCount * tripDays * otherRate;

    const crewExpensesTotal = hotelTotal + mealsTotal + otherTotal + rentalCar + airfare + mileage;
    const crewSubtotal = crewDayTotal + crewExpensesTotal;

    // Hourly programs
    const maintenanceTotal = totalFlightHours * maintenanceRate;
    const consumablesTotal = totalFlightHours * consumablesRate;
    const additionalTotal = totalFlightHours * additionalRate;
    const hourlySubtotal = maintenanceTotal + consumablesTotal + additionalTotal;

    // Fuel
    const fuelSubtotal = totalFuelGallons * fuelPrice;

    // Airport & Ground
    const airportSubtotal = landingFees + catering + handling + passengerTransport +
                           facilityFees + specialEventFees + rampParking + customs +
                           hangar + otherAirport;

    // Miscellaneous
    const miscSubtotal = tripCoordinationFee + otherMisc;

    // Total
    const estimatedTotal = crewSubtotal + hourlySubtotal + fuelSubtotal + airportSubtotal + miscSubtotal;

    return {
        legsSummary,
        totalHours,
        remainingMinutes,
        totalFuelGallons,
        totalFlightHours,
        crewDetails,
        crewDayTotal,
        tripDays,
        hotelTotal,
        mealsTotal,
        otherTotal,
        rentalCar,
        airfare,
        mileage,
        crewCount,
        hotelStays,
        hotelRate,
        mealsRate,
        crewExpensesTotal,
        crewSubtotal,
        maintenanceTotal,
        maintenanceRate,
        consumablesTotal,
        consumablesRate,
        additionalTotal,
        additionalRate,
        hourlySubtotal,
        fuelSubtotal,
        fuelPrice,
        landingFees,
        catering,
        handling,
        passengerTransport,
        facilityFees,
        specialEventFees,
        rampParking,
        customs,
        hangar,
        otherAirport,
        airportSubtotal,
        tripCoordinationFee,
        otherMisc,
        miscSubtotal,
        estimatedTotal,
        tripNotes,
        includeAPU,
        apuBurn,
        totalAPUFuel,
        activeLegsCount,
        fuelDensity
    };
}
