import { create } from 'zustand'

interface UserTypeState {
  userType: 'business' | 'personal'
  setUserType: (type: 'business' | 'personal') => void
}

export const useUserTypeStore = create<UserTypeState>((set) => ({
  userType: 'personal',
  setUserType: (type) => set({ userType: type }),
}))
