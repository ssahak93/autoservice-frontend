import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { unwrapResponseData, unwrapArrayResponse } from '@/lib/utils/api-response';

export type ProviderRole = 'owner' | 'manager' | 'employee';

export interface TeamMember {
  id: string;
  userId: string | null;
  role: ProviderRole;
  firstName: string;
  lastName: string;
  avatarFileId: string | null;
  avatarUrl: string | null;
  specialization: string | null;
  bio: string | null;
  isActive: boolean;
  phoneNumber: string | null;
  email: string | null;
  joinedAt: string;
}

export interface InviteTeamMemberRequest {
  role: ProviderRole;
  specialization?: string;
  bio?: string;
  yearsOfExperience?: number;
  workPhotoFileIds?: string[];
}

export interface UpdateTeamMemberRequest {
  firstName?: string;
  lastName?: string;
  avatarFileId?: string;
  specialization?: string;
  bio?: string;
  role?: ProviderRole;
  isActive?: boolean;
  yearsOfExperience?: number;
  workPhotoFileIds?: string[];
}

export interface QRInvitationResponse {
  success: boolean;
  invitationCode: string;
  qrUrl: string;
  qrCodeSvg?: string; // SVG string for QR code
  qrData: string;
  teamMemberId: string;
  message: string;
}

export interface PendingInvitation {
  id: string;
  role: ProviderRole;
  firstName: string;
  lastName: string;
  specialization: string | null;
  bio: string | null;
  yearsOfExperience: number | null;
  invitationCode: string | null;
  qrUrl: string | null;
  qrCodeSvg?: string | null; // SVG string for QR code
  invitedAt: string;
  invitedBy: string;
}

export const teamService = {
  async getTeam(providerId?: string): Promise<TeamMember[]> {
    const config = providerId ? { params: { providerId } } : undefined;
    const response = await apiClient.get<TeamMember[] | { success: boolean; data: TeamMember[] }>(
      API_ENDPOINTS.TEAM.LIST,
      config
    );
    return unwrapArrayResponse(response);
  },

  async generateInvitationQR(
    data: InviteTeamMemberRequest,
    providerId?: string
  ): Promise<QRInvitationResponse> {
    const params = providerId ? { providerId } : {};
    const response = await apiClient.post<
      QRInvitationResponse | { success: boolean; data: QRInvitationResponse }
    >(API_ENDPOINTS.TEAM.GENERATE_QR, data, { params });
    return unwrapResponseData(response);
  },

  async updateTeamMember(
    memberId: string,
    data: UpdateTeamMemberRequest,
    providerId?: string
  ): Promise<TeamMember> {
    const config = providerId ? { params: { providerId } } : undefined;
    const response = await apiClient.put<TeamMember | { success: boolean; data: TeamMember }>(
      API_ENDPOINTS.TEAM.UPDATE(memberId),
      data,
      config
    );
    return unwrapResponseData(response);
  },

  async removeTeamMember(
    memberId: string,
    providerId?: string
  ): Promise<{ success: boolean; message: string }> {
    const config = providerId ? { params: { providerId } } : undefined;
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      API_ENDPOINTS.TEAM.REMOVE(memberId),
      config
    );
    return unwrapResponseData(response);
  },

  async getPendingInvitations(providerId?: string): Promise<PendingInvitation[]> {
    const config = providerId ? { params: { providerId } } : undefined;
    const response = await apiClient.get<
      PendingInvitation[] | { success: boolean; data: PendingInvitation[] }
    >(API_ENDPOINTS.TEAM.PENDING_INVITATIONS, config);
    return unwrapArrayResponse(response);
  },

  async cancelInvitation(
    invitationId: string,
    providerId?: string
  ): Promise<{ success: boolean; message: string }> {
    const config = providerId ? { params: { providerId } } : undefined;
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      API_ENDPOINTS.TEAM.CANCEL_INVITATION(invitationId),
      config
    );
    return unwrapResponseData(response);
  },
};
