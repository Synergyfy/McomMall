const fs = require('fs');
const content = fs.readFileSync('src/resources/wallet/wallet.service.spec.ts', 'utf8');

const newContent = content.replace(
  "mockOrderService.getOrdersForOwner.mockResolvedValue(orders);",
  "mockOrderService.getOrdersForOwner.mockResolvedValue({ data: orders, meta: { totalItems: 2 } });"
).replace(
  "mockOrderService.getOrdersForOwner.mockResolvedValue(orders);",
  "mockOrderService.getOrdersForOwner.mockResolvedValue({ data: orders, meta: { totalItems: 3 } });"
);

fs.writeFileSync('src/resources/wallet/wallet.service.spec.ts', newContent);
