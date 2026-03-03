const fs = require('fs');
let content = fs.readFileSync('apps/mcom_mallAPI/test/booking.e2e-spec.ts', 'utf8');

const replacement = `
    const hourlyService = await serviceRepo.save(
      serviceRepo.create({
        name: 'Hourly Work',
        business: (await bizRepo.find())[0],
        isActive: true,
        pricingModel: PricingModel.PER_HOUR,
        pricePerHour: 50,
        availability: {
          maxBookingsPerSlot: 1,
          schedule: [
            { day: 'MONDAY', enabled: true, startTime: '00:00', endTime: '23:59', maxBookings: 1 },
            { day: 'TUESDAY', enabled: true, startTime: '00:00', endTime: '23:59', maxBookings: 1 },
            { day: 'WEDNESDAY', enabled: true, startTime: '00:00', endTime: '23:59', maxBookings: 1 },
            { day: 'THURSDAY', enabled: true, startTime: '00:00', endTime: '23:59', maxBookings: 1 },
            { day: 'FRIDAY', enabled: true, startTime: '00:00', endTime: '23:59', maxBookings: 1 },
            { day: 'SATURDAY', enabled: true, startTime: '00:00', endTime: '23:59', maxBookings: 1 },
            { day: 'SUNDAY', enabled: true, startTime: '00:00', endTime: '23:59', maxBookings: 1 },
          ],
        },
      }),
    );
`;

content = content.replace(/const hourlyService = await serviceRepo\.save\([\s\S]*?pricePerHour: 50,\s*\}\),\s*\);/, replacement.trim());

fs.writeFileSync('apps/mcom_mallAPI/test/booking.e2e-spec.ts', content);
