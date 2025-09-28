import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Query keys for consistent caching
export const queryKeys = {
  projects: ['projects'] as const,
  userVotes: (userId: string) => ['userVotes', userId] as const,
  userProjects: (userId: string) => ['userProjects', userId] as const,
  projectDetails: (projectId: string) => ['projectDetails', projectId] as const,
};

// Fetch functions for client-side queries
export const fetchProjects = async () => {
  const response = await fetch('/api/projects');
  if (!response.ok) throw new Error('Failed to fetch projects');
  return response.json();
};

export const fetchUserVotes = async (userId: string) => {
  const response = await fetch(`/api/votes/user/${userId}`);
  if (!response.ok) throw new Error('Failed to fetch user votes');
  return response.json();
};

export const voteForProject = async ({ projectId, action }: { projectId: string; action: 'add' | 'remove' }) => {
  const response = await fetch('/api/votes/toggle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId, action }),
  });
  if (!response.ok) throw new Error('Failed to vote');
  return response.json();
};

// Custom hooks for React Query
export const useProjects = () => {
  return useQuery({
    queryKey: queryKeys.projects,
    queryFn: fetchProjects,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useUserVotes = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.userVotes(userId),
    queryFn: () => fetchUserVotes(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useVoteMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: voteForProject,
    onSuccess: () => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
      queryClient.invalidateQueries({ queryKey: ['userVotes'] });
    },
  });
};
