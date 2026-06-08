import type {
  ApiSuccess,
  ExpenseCategoryDto,
  ExpenseDto,
  InvestmentDto,
  Paginated,
} from "@riz/shared";

import { baseApi } from "./baseApi";

export interface ExpenseCategoryInput {
  name: string;
  description?: string | null;
  isActive?: boolean;
}

export interface ExpenseInput {
  expenseCategoryId: number;
  expenseDate: string;
  amount: number;
  description?: string | null;
  vendorName?: string | null;
  paymentMethod?: string | null;
  transactionReference?: string | null;
  invoiceNumber?: string | null;
}

export interface InvestmentInput {
  investorName: string;
  amount: number;
  transactionMedium?: string | null;
  transactionFromAccount?: string | null;
  receivedAccount?: string | null;
  proofDetails?: string | null;
  updateReason?: string | null;
}

export interface ExpenseListParams {
  page?: number;
  pageSize?: number;
  categoryId?: number;
  from?: string;
  to?: string;
}

export const financeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ---- Expense categories ----
    getExpenseCategories: builder.query<ExpenseCategoryDto[], { includeInactive?: boolean } | void>(
      {
        query: (params) => ({ url: "/expense-categories", params: params ?? {} }),
        transformResponse: (response: ApiSuccess<ExpenseCategoryDto[]>) => response.data,
        providesTags: ["ExpenseCategory"],
      },
    ),
    createExpenseCategory: builder.mutation<ExpenseCategoryDto, ExpenseCategoryInput>({
      query: (body) => ({ url: "/expense-categories", method: "POST", body }),
      transformResponse: (response: ApiSuccess<ExpenseCategoryDto>) => response.data,
      invalidatesTags: ["ExpenseCategory"],
    }),
    updateExpenseCategory: builder.mutation<
      ExpenseCategoryDto,
      { id: number; body: Partial<ExpenseCategoryInput> }
    >({
      query: ({ id, body }) => ({ url: `/expense-categories/${id}`, method: "PATCH", body }),
      transformResponse: (response: ApiSuccess<ExpenseCategoryDto>) => response.data,
      invalidatesTags: ["ExpenseCategory"],
    }),
    deleteExpenseCategory: builder.mutation<{ message: string }, number>({
      query: (id) => ({ url: `/expense-categories/${id}`, method: "DELETE" }),
      invalidatesTags: ["ExpenseCategory"],
    }),

    // ---- Expenses ----
    getExpenses: builder.query<Paginated<ExpenseDto>, ExpenseListParams | void>({
      query: (params) => ({ url: "/expenses", params: params ?? {} }),
      transformResponse: (response: ApiSuccess<Paginated<ExpenseDto>>) => response.data,
      providesTags: ["Expense"],
    }),
    createExpense: builder.mutation<ExpenseDto, ExpenseInput>({
      query: (body) => ({ url: "/expenses", method: "POST", body }),
      transformResponse: (response: ApiSuccess<ExpenseDto>) => response.data,
      invalidatesTags: ["Expense"],
    }),
    updateExpense: builder.mutation<ExpenseDto, { id: number; body: Partial<ExpenseInput> }>({
      query: ({ id, body }) => ({ url: `/expenses/${id}`, method: "PATCH", body }),
      transformResponse: (response: ApiSuccess<ExpenseDto>) => response.data,
      invalidatesTags: ["Expense"],
    }),
    deleteExpense: builder.mutation<{ message: string }, number>({
      query: (id) => ({ url: `/expenses/${id}`, method: "DELETE" }),
      invalidatesTags: ["Expense"],
    }),

    // ---- Investments ----
    getInvestments: builder.query<
      Paginated<InvestmentDto>,
      { page?: number; pageSize?: number } | void
    >({
      query: (params) => ({ url: "/investments", params: params ?? {} }),
      transformResponse: (response: ApiSuccess<Paginated<InvestmentDto>>) => response.data,
      providesTags: ["Investment"],
    }),
    createInvestment: builder.mutation<InvestmentDto, InvestmentInput>({
      query: (body) => ({ url: "/investments", method: "POST", body }),
      transformResponse: (response: ApiSuccess<InvestmentDto>) => response.data,
      invalidatesTags: ["Investment"],
    }),
    updateInvestment: builder.mutation<
      InvestmentDto,
      { id: number; body: Partial<InvestmentInput> }
    >({
      query: ({ id, body }) => ({ url: `/investments/${id}`, method: "PATCH", body }),
      transformResponse: (response: ApiSuccess<InvestmentDto>) => response.data,
      invalidatesTags: ["Investment"],
    }),
    deleteInvestment: builder.mutation<{ message: string }, number>({
      query: (id) => ({ url: `/investments/${id}`, method: "DELETE" }),
      invalidatesTags: ["Investment"],
    }),
  }),
});

export const {
  useGetExpenseCategoriesQuery,
  useCreateExpenseCategoryMutation,
  useUpdateExpenseCategoryMutation,
  useDeleteExpenseCategoryMutation,
  useGetExpensesQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
  useGetInvestmentsQuery,
  useCreateInvestmentMutation,
  useUpdateInvestmentMutation,
  useDeleteInvestmentMutation,
} = financeApi;
