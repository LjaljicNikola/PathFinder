import tripApi from '../../../api/tripApi';
import type { Expense } from '../types/Expense';
import type { CreateExpenseRequest } from '../types/CreateExpenseRequest';

export const expenseApi = {
    create: (data: CreateExpenseRequest) =>
        tripApi.post<Expense>('/expenses', data).then((r) => r.data),

    remove: (id: number) =>
        tripApi.delete(`/expenses/${id}`),
};