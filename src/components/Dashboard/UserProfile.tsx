import { useUser } from "@clerk/nextjs";
import { useClerk } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LogOut, UserCircle, Settings, Camera, Edit, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { GlowingButton } from "../Dashboard/buttons/GlowingButton";
import { FuturisticInput } from "../Dashboard/buttons/FuturisticInput";
import Image from "next/image";

const UserProfile = () => {
  const { user } = useUser();
  const { signOut } = useClerk();

  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || user?.username || '',
    username: user?.username || '',
  });
  const [isLoading, setIsLoading] = useState(false);

  if (!user) return null;

  const fullName = user.fullName || user.username || 'User';
  const fallbackText = fullName[0].toUpperCase();
  
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  const handleProfileUpdate = async () => {
    setIsLoading(true);
    try {
      await user.update({
        firstName: profileData.fullName.split(' ')[0],
        lastName: profileData.fullName.split(' ').slice(1).join(' '),
        username: profileData.username,
      });
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      await user.setProfileImage({ file });
      toast.success("Profile image updated");
    } catch (error) {
      toast.error("Failed to update profile image");
    } finally {
      setIsLoading(false);
    }
  };


interface ProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;  // Using any for now, can be typed properly with Clerk types
}

const getUserData = (user: any) => {
  // Check if user has external accounts
  const externalAccounts = user?.externalAccounts || [];
  const linkedInAccount = externalAccounts.find(
    (account: any) => account.provider.toLowerCase() === 'linkedin'
  );

  // If LinkedIn account exists, use its data
  if (linkedInAccount) {
    // Try to get data from externalProfile first
    const externalProfile = linkedInAccount.externalProfile || {};
    return {
      firstName: externalProfile.firstName || linkedInAccount.firstName || user.firstName || "",
      lastName: externalProfile.lastName || linkedInAccount.lastName || user.lastName || "",
      profileImageUrl: externalProfile.imageUrl || linkedInAccount.imageUrl || user.imageUrl,
      email: user.primaryEmailAddress?.emailAddress,
      username: linkedInAccount.username || user.username || "",
      provider: "LinkedIn"
    };
  }

  // Default to regular user data
  return {
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    profileImageUrl: user.imageUrl,
    email: user.primaryEmailAddress?.emailAddress,
    username: user.username || "",
    provider: "Email"
  };
};

const ProfileDialog = ({ isOpen, onClose, user }: ProfileDialogProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get user data including LinkedIn profile if available
  const userData = getUserData(user);
  const [firstName, setFirstName] = useState(userData.firstName);
  const [lastName, setLastName] = useState(userData.lastName);

  useEffect(() => {
    const newUserData = getUserData(user);
    setFirstName(newUserData.firstName);
    setLastName(newUserData.lastName);
  }, [user]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      await user.setProfileImage({ file });
      toast.success("Profile image updated!");
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error("Failed to update profile image");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      setIsLoading(true);
      await user.update({
        firstName,
        lastName,
      });
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-gray-900 to-gray-800 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Profile Settings</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex flex-col items-center space-y-6">
            {/* Avatar with upload */}
            <div className="relative group">
              <Avatar className="h-24 w-24 ring-4 ring-offset-4 ring-offset-gray-900 ring-blue-500/50 group-hover:ring-blue-500 transition-all duration-300">
                <AvatarImage src={userData.profileImageUrl} alt={`${userData.firstName} ${userData.lastName}`} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-2xl">
                  {userData.firstName?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              {userData.provider !== "LinkedIn" && (
                <label className="absolute bottom-0 right-0 p-2 bg-blue-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer hover:bg-blue-600">
                  <Camera className="h-4 w-4" />
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isLoading}
                  />
                </label>
              )}
            </div>

            {/* Profile Info */}
            <div className="w-full space-y-6 relative">
              {isEditing ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Modern First Name Input */}
                  <div className="relative group">
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder=" "
                      disabled={isLoading}
                      className="w-full h-12 px-4 text-white bg-gray-800/50 rounded-lg border-2 border-gray-700 
                               focus:border-blue-500 transition-all duration-300 outline-none peer
                               group-hover:border-blue-400"
                    />
                    <label className="absolute left-2 top-2 px-2 text-sm text-gray-400 
                                   transition-all duration-300 pointer-events-none
                                   peer-focus:-translate-y-7 peer-focus:text-blue-500
                                   peer-[:not(:placeholder-shown)]:-translate-y-7"
                    >
                      First Name
                    </label>
                  </div>

                  {/* Modern Last Name Input */}
                  <div className="relative group">
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder=" "
                      disabled={isLoading}
                      className="w-full h-12 px-4 text-white bg-gray-800/50 rounded-lg border-2 border-gray-700 
                               focus:border-blue-500 transition-all duration-300 outline-none peer
                               group-hover:border-blue-400"
                    />
                    <label className="absolute left-2 top-2 px-2 text-sm text-gray-400 
                                   transition-all duration-300 pointer-events-none
                                   peer-focus:-translate-y-7 peer-focus:text-blue-500
                                   peer-[:not(:placeholder-shown)]:-translate-y-7"
                    >
                      Last Name
                    </label>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    {/* Cancel Button */}
                    <motion.button
                      onClick={() => setIsEditing(false)}
                      disabled={isLoading}
                      className="flex-1 h-12 relative group"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg opacity-75" />
                      <div className="relative h-full flex items-center justify-center bg-black/20 rounded-lg px-6">
                        <span className="text-white font-medium">Cancel</span>
                      </div>
                    </motion.button>

                    {/* Save Button */}
                    <motion.button
                      onClick={handleProfileUpdate}
                      disabled={isLoading}
                      className="flex-1 h-12 relative group"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg opacity-75" />
                      <div className="relative h-full flex items-center justify-center bg-black/20 rounded-lg px-6">
                        <span className="text-white font-medium">
                          {isLoading ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                            />
                          ) : (
                            "Save Changes"
                          )}
                        </span>
                      </div>
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6 rounded-lg"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                      {`${userData.firstName} ${userData.lastName}`}
                    </h3>
                    <p className="text-gray-400">{userData.email}</p>
                    {userData.provider === "LinkedIn" && (
                      <div className="flex items-center space-x-2 bg-blue-500/10 px-3 py-1 rounded-full">
                        <Image src="/linkedin.svg" alt="LinkedIn" className="w-4 h-4" />
                        <span className="text-sm text-blue-400">LinkedIn Account</span>
                      </div>
                    )}
                  </div>

                  {userData.provider !== "LinkedIn" && (
                    <motion.button
                      onClick={() => setIsEditing(true)}
                      className="rounded-2xl w-full h-12 relative group"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl" />
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl
                                   opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                      <div className="relative h-full flex items-center justify-center gap-2 bg-gray-800/50 
                                  rounded-xl border border-gray-700 group-hover:border-blue-500/50 
                                   transition-colors duration-300">
                        <Edit className="w-4 h-4 text-blue-400" />
                        <span className="text-white font-medium">Edit Profile</span>
                      </div>
                    </motion.button>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

  

  const SettingsDialog = () => (
    <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
      <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-gray-900 to-gray-800 border-gray-800">
        {/* <AdvancedCursor /> */}
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Account Settings</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          {/* Notification Settings */}
          <div className="space-y-4">
            <div 
              className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl hover:bg-gray-700/50 cursor-pointer transition-all duration-300"
              onClick={() => toast.info("Notification settings coming soon!")}
            >
              <div className="flex items-center space-x-3">
                <Bell className="h-5 w-5 text-blue-400" />
                <div>
                  <h4 className="text-white font-medium">Notifications</h4>
                  <p className="text-sm text-gray-400">Manage your alerts and notifications</p>
                </div>
              </div>
            </div>

            {/* Add more settings sections here */}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.button
            className="outline-none"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-offset-2 ring-offset-gray-900 transition-all duration-300 ring-blue-500/50 hover:ring-blue-500">
              <AvatarImage 
                src={user.imageUrl} 
                alt={fullName}
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                {fallbackText}
              </AvatarFallback>
            </Avatar>
          </motion.button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          className="w-64 mt-2 p-2 bg-gradient-to-br from-gray-900 to-gray-800 border-gray-800 shadow-xl"
          align="end"
        >
          <DropdownMenuLabel className="px-2 py-2">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.imageUrl} alt={fullName} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500">
                  {fallbackText}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">{fullName}</span>
                <span className="text-xs text-gray-400">{user.primaryEmailAddress?.emailAddress}</span>
              </div>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator className="bg-gray-700/50 my-2" />
          
          <DropdownMenuItem 
            className="flex items-center space-x-2 px-2 py-2 hover:bg-red-800/50 rounded-lg cursor-help text-white transition-colors duration-200"
            onClick={() => setShowProfileDialog(true)}
          >
            <UserCircle className="h-4 w-4 text-blue-400" />
            <span>Profile</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            className="flex items-center space-x-2 px-2 py-2 hover:bg-red-800/50 rounded-lg cursor-help text-white transition-colors duration-200"
            onClick={() => setShowSettingsDialog(true)}
          >
            <Settings className="h-4 w-4 text-blue-400" />
            <span>Settings</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="bg-gray-700/50 my-2" />
          
          <DropdownMenuItem           
            className="flex items-center space-x-2 px-2 py-2 hover:bg-red-500/10 rounded-lg cursor-help text-red-400 hover:text-red-300 transition-colors duration-200"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" type="button"/>
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialogs */}
<ProfileDialog 
  isOpen={showProfileDialog}
  onClose={() => setShowProfileDialog(false)}
  user={user}
/>      <SettingsDialog />
    </>
  );
};

export default UserProfile;