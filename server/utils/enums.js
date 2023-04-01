const transactionStatusEnum = ['REFUSED', 'PENDING', 'APPROVED'];
const transactionGatewayEnum = ['CREDIT_CARD', 'CHECK', 'DEPOSIT'];
const userRolesEnum = ['CLIENT', 'ADMIN'];
const accountTypesEnum = ['BASIC', 'SAVING', 'FROZEN'];

module.exports = {
  accountTypesEnum, userRolesEnum, transactionGatewayEnum, transactionStatusEnum,
};
