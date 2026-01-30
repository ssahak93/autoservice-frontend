import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

export type AutoServiceRole = 'owner' | 'manager' | 'employee';

export interface TeamMember {
  id: string;
  userId: string | null;
  role: AutoServiceRole;
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
  role: AutoServiceRole;
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
  role?: AutoServiceRole;
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
  role: AutoServiceRole;
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
  async getTeam(autoServiceId?: string): Promise<TeamMember[]> {
    const config = autoServiceId ? { params: { autoServiceId } } : undefined;
    const response = await apiClient.get<TeamMember[]>(API_ENDPOINTS.TEAM.LIST, config);
    return response.data;
  },

  async generateInvitationQR(
    data: InviteTeamMemberRequest,
    autoServiceId?: string
  ): Promise<QRInvitationResponse> {
    const params = autoServiceId ? { autoServiceId } : {};
    const response = await apiClient.post<QRInvitationResponse>(
      API_ENDPOINTS.TEAM.GENERATE_QR,
      data,
      { params }
    );
    return response.data;
  },

  async updateTeamMember(
    memberId: string,
    data: UpdateTeamMemberRequest,
    autoServiceId?: string
  ): Promise<TeamMember> {
    const config = autoServiceId ? { params: { autoServiceId } } : undefined;
    const response = await apiClient.put<TeamMember>(
      API_ENDPOINTS.TEAM.UPDATE(memberId),
      data,
      config
    );
    return response.data;
  },

  async removeTeamMember(
    memberId: string,
    autoServiceId?: string
  ): Promise<{ success: boolean; message: string }> {
    const config = autoServiceId ? { params: { autoServiceId } } : undefined;
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      API_ENDPOINTS.TEAM.REMOVE(memberId),
      config
    );
    return response.data;
  },

  async getPendingInvitations(autoServiceId?: string): Promise<PendingInvitation[]> {
    const config = autoServiceId ? { params: { autoServiceId } } : undefined;
    const response = await apiClient.get<PendingInvitation[]>(
      API_ENDPOINTS.TEAM.PENDING_INVITATIONS,
      config
    );
    return response.data;
  },

  async cancelInvitation(
    invitationId: string,
    autoServiceId?: string
  ): Promise<{ success: boolean; message: string }> {
    const config = autoServiceId ? { params: { autoServiceId } } : undefined;
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      API_ENDPOINTS.TEAM.CANCEL_INVITATION(invitationId),
      config
    );
    return response.data;
  },
};
