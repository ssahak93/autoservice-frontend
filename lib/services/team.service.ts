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
  firstName?: string;
  lastName?: string;
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
  qrData: string;
  teamMemberId: string;
  message: string;
}

export const teamService = {
  async getTeam(): Promise<TeamMember[]> {
    const response = await apiClient.get<TeamMember[]>(API_ENDPOINTS.TEAM.LIST);
    return response.data;
  },

  async generateInvitationQR(data: InviteTeamMemberRequest): Promise<QRInvitationResponse> {
    const response = await apiClient.post<QRInvitationResponse>(
      API_ENDPOINTS.TEAM.GENERATE_QR,
      data
    );
    return response.data;
  },

  async updateTeamMember(memberId: string, data: UpdateTeamMemberRequest): Promise<TeamMember> {
    const response = await apiClient.put<TeamMember>(API_ENDPOINTS.TEAM.UPDATE(memberId), data);
    return response.data;
  },

  async removeTeamMember(memberId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      API_ENDPOINTS.TEAM.REMOVE(memberId)
    );
    return response.data;
  },
};
