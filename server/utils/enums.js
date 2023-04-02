const transactionStatusEnum = { REFUSED: 'REFUSED', PENDING: 'PENDING', APPROVED: 'APPROVED' };
const transactionGatewayEnum = {
  CREDIT_CARD: 'CREDIT_CARD', TRANSFER: 'TRANSFER', CHECK: 'CHECK', DEPOSIT: 'DEPOSIT',
};
const userRolesEnum = { CLIENT: 'CLIENT', ADMIN: 'ADMIN' };
const accountTypesEnum = { BASIC: 'BASIC', SAVING: 'SAVING', FROZEN: 'FROZEN' };

module.exports = {
  accountTypesEnum, userRolesEnum, transactionGatewayEnum, transactionStatusEnum,
};
