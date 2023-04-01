const transactionStatusEnum = ['REFUSED', 'PENDING', 'APPROVED'];
const transactionGatewayEnum = ['CREDIT_CARD', 'CHECK', 'DEPOSIT'];
const userRoles = ['Client', 'Admin'];

module.exports = { userRoles, transactionGatewayEnum, transactionStatusEnum };
