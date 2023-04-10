const transactionStatusEnum = { REFUSED: 'REFUSED', PENDING: 'PENDING', APPROVED: 'APPROVED' };
const transactionGatewayEnum = {
  CREDIT_CARD: 'CREDIT_CARD', TRANSFER: 'TRANSFER', CHECK: 'CHECK', DEPOSIT: 'DEPOSIT',
};
const userRolesEnum = { CLIENT: 'CLIENT', ADMIN: 'ADMIN' };
const accountTypesEnum = { BASIC: 'BASIC', SAVING: 'SAVING', FROZEN: 'FROZEN' };
const ibanToCurrencies = {
  AD: 'EUR',
  AE: 'AED',
  AL: 'ALL',
  AT: 'EUR',
  AZ: 'AZN',
  BA: 'BAM',
  BE: 'EUR',
  BG: 'BGN',
  BH: 'BHD',
  BR: 'BRL',
  CH: 'CHF',
  CR: 'CRC',
  CY: 'EUR',
  CZ: 'CZK',
  DE: 'EUR',
  DK: 'DKK',
  DO: 'DOP',
  EE: 'EUR',
  ES: 'EUR',
  FI: 'EUR',
  FO: 'DKK',
  FR: 'EUR',
  GB: 'GBP',
  GI: 'GIP',
  GL: 'DKK',
  GR: 'EUR',
  GT: 'GTQ',
  HR: 'HRK',
  HU: 'HUF',
  IE: 'EUR',
  IL: 'ILS',
  IS: 'ISK',
  IT: 'EUR',
  JO: 'JOD',
  KW: 'KWD',
  KZ: 'KZT',
  LB: 'LBP',
  LI: 'CHF',
  LT: 'EUR',
  LU: 'EUR',
  LV: 'EUR',
  MC: 'EUR',
  MD: 'MDL',
  ME: 'EUR',
  MK: 'MKD',
  MR: 'MRO',
  MT: 'EUR',
  MU: 'MUR',
  NL: 'EUR',
  NO: 'NOK',
  PK: 'PKR',
  PL: 'PLN',
  PS: 'ILS',
  PT: 'EUR',
  QA: 'QAR',
  RO: 'RON',
  RS: 'RSD',
  SA: 'SAR',
  SE: 'SEK',
  SI: 'EUR',
  SK: 'EUR',
  SM: 'EUR',
  TL: 'USD',
  TN: 'TND',
  TR: 'TRY',
  VG: 'USD',
  XK: 'EUR',
};

const subscriptionTypes = { DEBIT: 'DEBIT', CREDIT: 'CREDIT' };
const subscriptionFrequency = { DAILY: 'DAILY', WEEKLY: 'WEEKLY', MONTHLY: 'MONTHLY' };

module.exports = {
  ibanToCurrencies,
  accountTypesEnum,
  userRolesEnum,
  transactionGatewayEnum,
  transactionStatusEnum,
  subscriptionTypes,
  subscriptionFrequency,
};
