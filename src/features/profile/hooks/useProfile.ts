import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { profileService, type UpdateProfileRequest, type EducationRequest } from "../services/profileService"
import { useAuthStore } from "@/store/authStore"
import toast from "react-hot-toast"

export function useProfile() {
  const { setUser, user } = useAuthStore()
  const qc = useQueryClient()

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["profile"] })
    qc.invalidateQueries({ queryKey: ["public-profile", user?.id] })
  }

  const query = useQuery({
    queryKey: ["profile"],
    queryFn:  async () => {
      const res = await profileService.getProfile()
      return res.data
    },
    enabled: !!user,
    refetchOnWindowFocus: true,
    staleTime: 15_000,
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdateProfileRequest) => profileService.updateProfile(data),
    onSuccess: (res) => {
      if (res.success && user) {
        setUser({ ...user, profile: res.data, isProfileComplete: true })
        invalidate()
        toast.success("Profile updated.")
      } else toast.error(res.message)
    },
    onError: () => toast.error("Failed to update profile."),
  })

  const photoMutation = useMutation({
    mutationFn: (file: File) => profileService.uploadPhoto(file),
    onSuccess: (res) => { if (res.success) { invalidate(); toast.success("Photo updated.") } },
    onError: () => toast.error("Failed to upload photo."),
  })

  const removePhotoMutation = useMutation({
    mutationFn: () => profileService.removePhoto(),
    onSuccess: (res) => { if (res.success) { invalidate(); toast.success("Photo removed.") } },
    onError: () => toast.error("Failed to remove photo."),
  })

  const coverMutation = useMutation({
    mutationFn: (file: File) => profileService.uploadCover(file),
    onSuccess: (res) => { if (res.success) { invalidate(); toast.success("Cover updated.") } },
    onError: () => toast.error("Failed to upload cover."),
  })

  const removeCoverMutation = useMutation({
    mutationFn: () => profileService.removeCover(),
    onSuccess: (res) => { if (res.success) { invalidate(); toast.success("Cover removed.") } },
    onError: () => toast.error("Failed to remove cover."),
  })

  const addEducationMutation = useMutation({
    mutationFn: (data: EducationRequest) => profileService.addEducation(data),
    onSuccess: (res) => {
      if (res.success) { invalidate(); toast.success("Education added.") }
      else toast.error(res.message)
    },
    onError: () => toast.error("Failed to add education."),
  })

  const updateEducationMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: EducationRequest }) =>
      profileService.updateEducation(id, data),
    onSuccess: (res) => {
      if (res.success) { invalidate(); toast.success("Education updated.") }
      else toast.error(res.message)
    },
    onError: () => toast.error("Failed to update education."),
  })

  const deleteEducationMutation = useMutation({
    mutationFn: (id: string) => profileService.deleteEducation(id),
    onSuccess: (res) => {
      if (res.success) { invalidate(); toast.success("Education removed.") }
      else toast.error(res.message)
    },
    onError: () => toast.error("Failed to remove education."),
  })

  return {
    profile:  query.data,
    isLoading: query.isLoading,

    updateProfile:  updateMutation.mutate,
    isUpdating:     updateMutation.isPending,

    uploadPhoto:    photoMutation.mutate,
    isUploading:    photoMutation.isPending,
    removePhoto:    removePhotoMutation.mutate,
    isRemovingPhoto: removePhotoMutation.isPending,

    uploadCover:    coverMutation.mutate,
    isUploadingCover: coverMutation.isPending,
    removeCover:    removeCoverMutation.mutate,
    isRemovingCover: removeCoverMutation.isPending,

    addEducation:       addEducationMutation.mutate,
    isAddingEducation:  addEducationMutation.isPending,
    updateEducation:    updateEducationMutation.mutate,
    isUpdatingEducation: updateEducationMutation.isPending,
    deleteEducation:    deleteEducationMutation.mutate,
    isDeletingEducation: deleteEducationMutation.isPending,
  }
}
