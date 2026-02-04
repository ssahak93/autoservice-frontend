'use client';

import { motion } from 'framer-motion';
import { Edit, Trash2, User, Shield, Briefcase, Crown, Users } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { SectionHeader } from '@/components/auto-service/SectionHeader';
import { Button } from '@/components/ui/Button';
import type { TeamMember } from '@/lib/services/team.service';
import { getTransition } from '@/lib/utils/animations';
import { cn } from '@/lib/utils/cn';
import { getAvatarUrl } from '@/lib/utils/file';
import { formatUserName } from '@/lib/utils/user';

interface TeamMemberListProps {
  members: TeamMember[];
  currentUserId?: string;
  isOwner: boolean;
  isManager: boolean;
  onEdit: (member: TeamMember) => void;
  onRemove: (member: TeamMember) => void;
}

export function TeamMemberList({
  members,
  currentUserId,
  isOwner,
  isManager,
  onEdit,
  onRemove,
}: TeamMemberListProps) {
  const t = useTranslations('dashboard.team');

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 'manager':
        return <Shield className="h-5 w-5 text-blue-500" />;
      case 'employee':
        return <Briefcase className="h-5 w-5 text-gray-500" />;
      default:
        return <User className="h-5 w-5 text-gray-400" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner':
        return t('roles.owner', { defaultValue: 'Owner' });
      case 'manager':
        return t('roles.manager', { defaultValue: 'Manager' });
      case 'employee':
        return t('roles.employee', { defaultValue: 'Employee' });
      default:
        return role;
    }
  };

  if (members.length === 0) {
    return (
      <div className="py-12 text-center">
        <User className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          {t('noMembers', { defaultValue: 'No team members yet' })}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SectionHeader
        icon={Users}
        title={t('members', { defaultValue: 'Team Members' })}
        count={members.length}
        iconColor="text-primary-600"
        badgeColor="bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300"
      />
      <div className="space-y-3">
        {members.map((member, index) => {
          const isCurrentUser = member.userId === currentUserId;
          const canEdit = isOwner || (isManager && member.role !== 'owner') || isCurrentUser;
          const canRemove = isOwner && member.role !== 'owner' && !isCurrentUser;
          const transition = getTransition(0.2);

          return (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...transition, delay: index * 0.05 }}
              whileHover={{ x: 4, transition: { duration: 0.2 } }}
              className={cn(
                'flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800',
                !member.isActive && 'opacity-60'
              )}
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
                  {getAvatarUrl({ avatarUrl: member.avatarUrl }) ? (
                    <Image
                      src={getAvatarUrl({ avatarUrl: member.avatarUrl })!}
                      alt={formatUserName(member.firstName, member.lastName, 'Team Member')}
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <User className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  )}
                </div>

                {/* Member Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {formatUserName(member.firstName, member.lastName)}
                    </h3>
                    {isCurrentUser && (
                      <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                        {t('you', { defaultValue: 'You' })}
                      </span>
                    )}
                    {!member.isActive && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                        {t('inactive', { defaultValue: 'Inactive' })}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    {getRoleIcon(member.role)}
                    <span>{getRoleLabel(member.role)}</span>
                    {member.specialization && (
                      <>
                        <span>•</span>
                        <span>{member.specialization}</span>
                      </>
                    )}
                  </div>
                  {member.email && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">{member.email}</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div
                className="flex items-center gap-2"
                role="group"
                aria-label={t('actions.group', { defaultValue: 'Team member actions' })}
              >
                {canEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(member)}
                    aria-label={t('actions.editMember', {
                      firstName: member.firstName,
                      lastName: member.lastName,
                      defaultValue: `Edit ${member.firstName} ${member.lastName}`,
                    })}
                  >
                    <Edit className="h-4 w-4" aria-hidden="true" />
                  </Button>
                )}
                {canRemove && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRemove(member)}
                    aria-label={t('actions.removeMember', {
                      firstName: member.firstName,
                      lastName: member.lastName,
                      defaultValue: `Remove ${member.firstName} ${member.lastName} from team`,
                    })}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" aria-hidden="true" />
                  </Button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
