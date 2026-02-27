const fs = require('fs');
let content = fs.readFileSync('src/resources/activity-timer/activity-timer.service.spec.ts', 'utf8');

content = content.replace(
  "      timerRepository.find.mockResolvedValue(tasks);",
  "      timerRepository.createQueryBuilder.mockReturnValue({\n        select: jest.fn().mockReturnThis(),\n        where: jest.fn().mockReturnThis(),\n        andWhere: jest.fn().mockReturnThis(),\n        orderBy: jest.fn().mockReturnThis(),\n        getMany: jest.fn().mockResolvedValue(tasks),\n      });"
).replace(
  "      timerRepository.find.mockResolvedValue(tasks);",
  "      timerRepository.createQueryBuilder.mockReturnValue({\n        select: jest.fn().mockReturnThis(),\n        where: jest.fn().mockReturnThis(),\n        andWhere: jest.fn().mockReturnThis(),\n        orderBy: jest.fn().mockReturnThis(),\n        getMany: jest.fn().mockResolvedValue(tasks),\n      });"
).replace(
  "      const result = await service.getUserActiveTasks(user);\n\n      // Trial Expiry = Jan 1 + 10 days = Jan 11",
  "      userActivityRepository.createQueryBuilder.mockReturnValue({\n        leftJoinAndSelect: jest.fn().mockReturnThis(),\n        where: jest.fn().mockReturnThis(),\n        select: jest.fn().mockReturnThis(),\n        getMany: jest.fn().mockResolvedValue([]),\n      });\n\n      const result = await service.getUserActiveTasks(user);\n\n      // Trial Expiry = Jan 1 + 10 days = Jan 11"
).replace(
  "      const result = await service.getUserActiveTasks(user);\n\n      expect(result[0].expiresAt).toEqual(fixedExpiry);",
  "      userActivityRepository.createQueryBuilder.mockReturnValue({\n        leftJoinAndSelect: jest.fn().mockReturnThis(),\n        where: jest.fn().mockReturnThis(),\n        select: jest.fn().mockReturnThis(),\n        getMany: jest.fn().mockResolvedValue([]),\n      });\n\n      const result = await service.getUserActiveTasks(user);\n\n      expect(result[0].expiresAt).toEqual(fixedExpiry);"
).replace(
  "membership: { tier: { configuration: { trialDurationDays: 10 } } }",
  "membership: { isTrial: true, isActive: true, expiresAt: new Date('2026-01-11T00:00:00Z'), tier: { configuration: { trialDurationDays: 10 } } }"
);

fs.writeFileSync('src/resources/activity-timer/activity-timer.service.spec.ts', content);
