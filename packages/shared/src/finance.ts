export interface ExpenseCategoryDto {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseDto {
  id: number;
  expenseCategoryId: number;
  expenseDate: string; // YYYY-MM-DD
  amount: number;
  description: string | null;
  vendorName: string | null;
  paymentMethod: string | null;
  transactionReference: string | null;
  invoiceNumber: string | null;
  createdBy: number | null;
  createdAt: string;
  updatedAt: string;
  category?: ExpenseCategoryDto;
}

export interface InvestmentDto {
  id: number;
  investorName: string;
  amount: number;
  transactionMedium: string | null;
  transactionFromAccount: string | null;
  receivedAccount: string | null;
  proofDetails: string | null;
  updateReason: string | null;
  updatedBy: number | null;
  createdAt: string;
  updatedAt: string;
}
