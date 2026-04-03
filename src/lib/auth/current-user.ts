/**
 * Профиль авторизованного сотрудника банка.
 * В продакшене данные должны приходить из SSO / сессии; здесь — единая точка для мока и подстановки в формы.
 */
export interface BankEmployeeProfile {
  fullName: string;
  tabNumber: string;
  department: string;
  email: string;
  phone: string;
}

const MOCK_CURRENT_EMPLOYEE: BankEmployeeProfile = {
  fullName: "Иванов Иван Иванович",
  tabNumber: "784512",
  department: "Департамент персонала",
  email: "ivanov.ii@gazprombank.ru",
  phone: "+7 (495) 123-45-67",
};

export function getCurrentBankEmployee(): BankEmployeeProfile {
  return MOCK_CURRENT_EMPLOYEE;
}
