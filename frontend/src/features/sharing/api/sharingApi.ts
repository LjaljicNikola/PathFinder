import publicTripApi from '../../../api/publicTripApi';
import tripApi from '../../../api/tripApi';
import type { ShareToken } from '../types/ShareToken';

export const sharingApi = {
    createToken: (travelPlanId: number, accessLevel: string) =>
        tripApi.post<{ token: string }>('/sharing', { travelPlanId, accessLevel }).then((r) => r.data.token),

    getTokensForPlan: (travelPlanId: number) =>
        tripApi.get<ShareToken[]>(`/sharing?travelPlanId=${travelPlanId}`).then((r) => r.data),

    revokeToken: (token: string) =>
        tripApi.delete(`/sharing/${token}`),

    checkToken: (token: string) =>
        publicTripApi.get<ShareToken>(`/sharing/${token}`).then((r) => r.data),
};