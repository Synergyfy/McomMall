const fs = require('fs');
const content = fs.readFileSync('src/resources/payments/services/payments.service.spec.ts', 'utf8');

const newContent = content.replace(
  "import { CentralIntegrationService } from './central-integration.service';",
  "import { CentralIntegrationService } from './central-integration.service';\nimport { ActivityTimerService } from '../../../resources/activity-timer/activity-timer.service';"
).replace(
  "          provide: CentralIntegrationService,\n          useValue: mockCentralIntegrationService,\n        },\n      ],\n    }).compile();",
  "          provide: CentralIntegrationService,\n          useValue: mockCentralIntegrationService,\n        },\n        {\n          provide: ActivityTimerService,\n          useValue: {},\n        }\n      ],\n    }).compile();"
);

fs.writeFileSync('src/resources/payments/services/payments.service.spec.ts', newContent);
