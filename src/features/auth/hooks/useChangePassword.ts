import { useMutation } from "@tanstack/react-query"
import { authService } from "../services/authService"
import type { ChangePasswordRequest } from "@/types/auth.types"
import toast from "react-hot-toast"

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => authService.changePassword(data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message || "Password changed.")
      } else {
        toast.error(res.message || "Failed to change password.")
      }
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Failed to change password."
      toast.error(msg)
    },
  })
}