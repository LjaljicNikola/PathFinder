import tripApi from '../../../api/tripApi';
import type { ChecklistItem } from '../types/ChecklistItem';
import type { CreateChecklistItemRequest } from '../types/CreateChecklistItemRequest';
import type { UpdateChecklistItemRequest } from '../types/UpdateChecklistItemRequest';

export const checklistApi = {
    create: (data: CreateChecklistItemRequest) =>
        tripApi.post<ChecklistItem>('/checklist', data).then((r) => r.data),

    update: (id: number, data: UpdateChecklistItemRequest) =>
        tripApi.put<ChecklistItem>(`/checklist/${id}`, data).then((r) => r.data),

    remove: (id: number) =>
        tripApi.delete(`/checklist/${id}`),
};