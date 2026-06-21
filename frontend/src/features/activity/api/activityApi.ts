import tripApi from '../../../api/tripApi';
import type { Activity } from '../types/Activity';
import type { CreateActivityRequest } from '../types/CreateActivityRequest';

export const activityApi = {
    create: (data: CreateActivityRequest) =>
        tripApi.post<Activity>('/activities', data).then((r) => r.data),

    remove: (id: number) =>
        tripApi.delete(`/activities/${id}`),
};