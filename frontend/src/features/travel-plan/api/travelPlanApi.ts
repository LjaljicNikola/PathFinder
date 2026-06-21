import tripApi from '../../../api/tripApi';
import type { TravelPlan } from '../types/TravelPlan';
import type { CreateTravelPlanRequest } from '../types/CreateTravelPlanRequest';
import type { UpdateTravelPlanRequest } from '../types/UpdateTravelPlanRequest';
import type { TravelPlanOverview } from '../types/TravelPlanOverview';

export const travelPlanApi = {
    getAll: () =>
        tripApi.get<TravelPlan[]>('/travel-plans').then((r) => r.data),

    getById: (id: number) =>
        tripApi.get<TravelPlan>(`/travel-plans/${id}`).then((r) => r.data),

    getOverview: (id: number) =>
        tripApi.get<TravelPlanOverview>(`/travel-plans/${id}/overview`).then((r) => r.data),

    create: (data: CreateTravelPlanRequest) =>
        tripApi.post<TravelPlan>('/travel-plans', data).then((r) => r.data),

    update: (id: number, data: UpdateTravelPlanRequest) =>
        tripApi.put<TravelPlan>(`/travel-plans/${id}`, data).then((r) => r.data),

    remove: (id: number) =>
        tripApi.delete(`/travel-plans/${id}`),
};