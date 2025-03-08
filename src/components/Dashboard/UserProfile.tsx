import { useUser } from "@clerk/nextjs";
import { useClerk } from "@clerk/nextjs";
import { useEffect, useState, useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
  DialogDescription,
} from "@/components/ui/dialog";
import { LogOut, UserCircle, Settings, Camera, Edit, Bell, ChevronRight, Shield, Key, Smartphone, Globe, Moon, Sun, Sparkles } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "next-themes";

const UserProfile = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { theme, setTheme } = useTheme();

  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [isHovering, setIsHovering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Mouse follower effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  if (!user) return null;

  const fullName = user.fullName || user.username || 'User';
  const fallbackText = fullName[0].toUpperCase();
  
  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      
      // Visual feedback animation before sign out
      toast.promise(
        new Promise((resolve) => {
          setTimeout(() => {
            signOut();
            resolve(true);
          }, 800);
        }),
        {
          loading: 'Signing out...',
          success: 'Signed out successfully',
          error: 'Failed to sign out',
        }
      );
    } catch (error) {
      toast.error("Failed to sign out");
      setIsLoading(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.button
            className="outline-none relative group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onHoverStart={() => setIsHovering(true)}
            onHoverEnd={() => setIsHovering(false)}
          >
            <AnimatePresence>
              {isHovering && (
                <motion.span
                  className="absolute -inset-1.5 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full blur-sm"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </AnimatePresence>
            <Avatar className="h-10 w-10 cursor-pointer ring-2 ring-offset-2 ring-offset-background transition-all duration-300 ring-blue-500/50 group-hover:ring-blue-500 z-10">
              <AvatarImage 
                src={user.imageUrl} 
                alt={fullName}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {fallbackText}
              </AvatarFallback>
            </Avatar>
          </motion.button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          className="w-72 p-2 bg-card/95 backdrop-blur-md border-border shadow-xl rounded-xl"
          align="end"
          sideOffset={8}
          asChild
        >
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <DropdownMenuLabel className="px-3 py-3">
              <div className="flex items-center space-x-3">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Avatar className="h-12 w-12 ring-2 ring-offset-2 ring-offset-background ring-blue-500/30">
                    <AvatarImage src={user.imageUrl} alt={fullName} className="object-cover" />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600">
                      {fallbackText}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
                <div className="flex flex-col">
                  <span className="text-base font-semibold text-foreground">{fullName}</span>
                  <span className="text-xs text-muted-foreground truncate max-w-[180px]">
                    {user.primaryEmailAddress?.emailAddress}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            
            <DropdownMenuSeparator className="bg-border my-2" />
            
            <div className="px-1 py-1 space-y-1">
              <DropdownMenuItem 
                className="flex items-center justify-between px-3 py-2.5 hover:bg-primary/10 rounded-lg cursor-pointer text-foreground transition-all duration-200"
                onClick={() => setShowProfileDialog(true)}
                asChild
              >
                <motion.div whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/10">
                      <UserCircle className="h-4 w-4 text-blue-500" />
                    </div>
                    <span className="font-medium">Profile</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </motion.div>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                className="flex items-center justify-between px-3 py-2.5 hover:bg-primary/10 rounded-lg cursor-pointer text-foreground transition-all duration-200"
                onClick={() => setShowSettingsDialog(true)}
                asChild
              >
                <motion.div whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/10">
                      <Settings className="h-4 w-4 text-purple-500" />
                    </div>
                    <span className="font-medium">Settings</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </motion.div>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="bg-border my-2" />
              
              <DropdownMenuItem 
                className="flex items-center justify-between px-3 py-2.5 hover:bg-red-500/10 rounded-lg cursor-pointer text-red-500 transition-all duration-200"
                onClick={handleSignOut}
                disabled={isLoading}
                asChild
              >
                <motion.div 
                  whileHover={{ x: 2 }} 
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500/10">
                      <LogOut className="h-4 w-4 text-red-500" />
                    </div>
                    <span className="font-medium">Sign out</span>
                  </div>
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full"
                    />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-red-500/70" />
                  )}
                </motion.div>
              </DropdownMenuItem>
            </div>
          </motion.div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Combined Profile & Settings Dialog */}
      <AnimatePresence>
        {(showProfileDialog || showSettingsDialog) && (
          <Dialog 
            open={showProfileDialog || showSettingsDialog} 
            onOpenChange={(open) => {
              if (!open) {
                setShowProfileDialog(false);
                setShowSettingsDialog(false);
              }
            }}
          >
            <DialogContent 
              className="sm:max-w-[500px] p-0 overflow-hidden bg-card border-border rounded-xl"
              onMouseMove={handleMouseMove}
            >
              <motion.div 
                className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 pointer-events-none"
                style={{ 
                  backgroundPosition: "calc(50% + 40px) calc(50% + 40px)",
                  backgroundSize: "120% 120%"
                }}
              />
              
              <div className="relative z-10">
                <Tabs 
                  defaultValue={showProfileDialog ? "profile" : "settings"} 
                  className="w-full"
                  onValueChange={setActiveTab}
                >
                  <div className="flex items-center justify-between px-6 pt-6 pb-4">
                    <DialogTitle className="text-xl font-semibold">
                      {activeTab === "profile" ? "Your Profile" : "Account Settings"}
                    </DialogTitle>
                    <TabsList className="grid grid-cols-2 h-9">
                      <TabsTrigger 
                        value="profile" 
                        className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                      >
                        Profile
                      </TabsTrigger>
                      <TabsTrigger 
                        value="settings"
                        className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                      >
                        Settings
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="profile" className="mt-0">
                    <ProfileTab user={user} />
                  </TabsContent>
                  
                  <TabsContent value="settings" className="mt-0">
                    <SettingsTab />
                  </TabsContent>
                </Tabs>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
};

const ProfileTab = ({ user }: { user: any }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isImageHovering, setIsImageHovering] = useState(false);
  
  // Get user data including external accounts if available
  const userData = getUserData(user);
  const [firstName, setFirstName] = useState(userData.firstName);
  const [lastName, setLastName] = useState(userData.lastName);
  const [bio, setBio] = useState(userData.bio || "");

  useEffect(() => {
    const newUserData = getUserData(user);
    setFirstName(newUserData.firstName);
    setLastName(newUserData.lastName);
    setBio(newUserData.bio || "");
  }, [user]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      await user.setProfileImage({ file });
      toast.success("Profile image updated!", {
        icon: <Sparkles className="h-4 w-4 text-yellow-400" />,
        className: "bg-card border border-border",
      });
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
      
      toast.promise(
        new Promise((resolve) => {
          setTimeout(async () => {
            await user.update({
              firstName,
              lastName,
              // Add bio update if your Clerk setup supports it
              // unsafeMetadata: { bio },
            });
            resolve(true);
          }, 800);
        }),
        {
          loading: 'Updating profile...',
          success: 'Profile updated successfully!',
          error: 'Failed to update profile',
        }
      );
      
      setIsEditing(false);
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col items-center space-y-6">
        {/* Avatar with upload */}
        <motion.div 
          className="relative group"
          whileHover={{ scale: 1.02 }}
          onHoverStart={() => setIsImageHovering(true)}
          onHoverEnd={() => setIsImageHovering(false)}
        >
          <div className="relative">
            <AnimatePresence>
              {isImageHovering && !isLoading && userData.provider !== "LinkedIn" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 bg-black/40 rounded-full z-10 flex items-center justify-center"
                >
                  <Camera className="h-8 w-8 text-white" />
                </motion.div>
              )}
            </AnimatePresence>
            
            <Avatar className="h-28 w-28 ring-4 ring-offset-4 ring-offset-background ring-blue-500/30 transition-all duration-300 group-hover:ring-blue-500/70">
              <AvatarImage 
                src={userData.profileImageUrl} 
                alt={`${userData.firstName} ${userData.lastName}`}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-3xl">
                {userData.firstName?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            {userData.provider !== "LinkedIn" && (
              <label className="absolute bottom-0 right-0 cursor-pointer">
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
          
          {isLoading && (
            <motion.div 
              className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-3 border-white border-t-transparent rounded-full"
              />
            </motion.div>
          )}
        </motion.div>

        {/* Profile Info */}
        <div className="w-full space-y-6 relative">
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div
                key="editing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* First Name Input */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-300" />
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First Name"
                    disabled={isLoading}
                    className="w-full h-12 px-4 text-foreground bg-card/50 rounded-lg border border-border 
                             focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all duration-300 outline-none
                             group-hover:border-blue-400 relative z-10"
                  />
                </div>

                {/* Last Name Input */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-300" />
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last Name"
                    disabled={isLoading}
                    className="w-full h-12 px-4 text-foreground bg-card/50 rounded-lg border border-border 
                             focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all duration-300 outline-none
                             group-hover:border-blue-400 relative z-10"
                  />
                </div>
                
                {/* Bio Input */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-300" />
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Write a short bio about yourself"
                    disabled={isLoading}
                    rows={3}
                    className="w-full p-4 text-foreground bg-card/50 rounded-lg border border-border 
                             focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all duration-300 outline-none
                             group-hover:border-blue-400 relative z-10 resize-none"
                  />
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
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-500/20 to-gray-600/20 rounded-lg opacity-75" />
                    <div className="relative h-full flex items-center justify-center rounded-lg px-6 border border-border">
                      <span className="text-foreground font-medium">Cancel</span>
                    </div>
                  </motion.button>

                  {/* Save Button */}
                  <motion.button
                    onClick={handleProfileUpdate}
                    disabled={isLoading}
                    className="flex-1 h-12 relative group overflow-hidden"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg opacity-90" />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative h-full flex items-center justify-center rounded-lg px-6">
                      {isLoading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                      ) : (
                        <span className="text-white font-medium">Save Changes</span>
                      )}
                    </div>
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="viewing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex flex-col items-center space-y-3">
                  <motion.h3 
                    className="text-2xl font-bold"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
                      {`${userData.firstName} ${userData.lastName}`}
                    </span>
                  </motion.h3>
                  
                  <motion.p 
                    className="text-muted-foreground text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {userData.email}
                  </motion.p>
                  
                  {userData.provider === "LinkedIn" && (
                    <motion.div 
                      className="flex items-center space-x-2 bg-blue-500/10 px-3 py-1.5 rounded-full"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Globe className="w-3.5 h-3.5 text-blue-500" />
                      <span className="text-sm text-blue-500 font-medium">LinkedIn Account</span>
                    </motion.div>
                  )}
                  
                  {bio && (
                    <motion.p 
                      className="text-sm text-muted-foreground text-center max-w-md mt-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      {bio}
                    </motion.p>
                  )}
                </div>

                {userData.provider !== "LinkedIn" && (
                  <motion.button
                    onClick={() => setIsEditing(true)}
                    className="w-full h-12 relative group overflow-hidden"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg" />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg
                                 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative h-full flex items-center justify-center gap-2 rounded-lg border border-border group-hover:border-blue-500/50 
                                 transition-colors duration-300">
                      <Edit className="w-4 h-4 text-blue-500" />
                      <span className="text-foreground font-medium">Edit Profile</span>
                    </div>
                  </motion.button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const SettingsTab = () => {
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: false
  });
  
  const handleThemeChange = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-4">
        {/* Theme Toggle */}
        <motion.div 
          className="flex items-center justify-between p-4 bg-card/50 rounded-xl border border-border hover:border-blue-500/30 transition-colors duration-300"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/10">
              {theme === 'dark' ? (
                <Moon className="h-5 w-5 text-blue-500" />
              ) : (
                <Sun className="h-5 w-5 text-blue-500" />
              )}
            </div>
            <div>
              <h4 className="text-foreground font-medium">Dark Mode</h4>
              <p className="text-sm text-muted-foreground">Toggle between light and dark themes</p>
            </div>
          </div>
          <Switch 
            checked={theme === 'dark'} 
            onCheckedChange={handleThemeChange}
            className="data-[state=checked]:bg-blue-500"
          />
        </motion.div>

        {/* Notification Settings */}
        <motion.div 
          className="flex items-center justify-between p-4 bg-card/50 rounded-xl border border-border hover:border-purple-500/30 transition-colors duration-300"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-500/10">
              <Bell className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <h4 className="text-foreground font-medium">Email Notifications</h4>
              <p className="text-sm text-muted-foreground">Receive email updates and alerts</p>
            </div>
          </div>
          <Switch 
            checked={notifications.email} 
            onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
            className="data-[state=checked]:bg-purple-500"
          />
        </motion.div>

        {/* Security Settings */}
        <motion.div 
          className="flex items-center justify-between p-4 bg-card/50 rounded-xl border border-border hover:border-green-500/30 transition-colors duration-300"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => toast.info("Security settings coming soon!")}
        >
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500/10">
              <Shield className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <h4 className="text-foreground font-medium">Security Settings</h4>
              <p className="text-sm text-muted-foreground">Manage account security and access</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </motion.div>

        {/* Two-Factor Authentication */}
        <motion.div 
          className="flex items-center justify-between p-4 bg-card/50 rounded-xl border border-border hover:border-amber-500/30 transition-colors duration-300"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => toast.info("Two-factor authentication coming soon!")}
        >
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-500/10">
              <Key className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <h4 className="text-foreground font-medium">Two-Factor Authentication</h4>
              <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </motion.div>

        {/* Device Management */}
        <motion.div 
          className="flex items-center justify-between p-4 bg-card/50 rounded-xl border border-border hover:border-indigo-500/30 transition-colors duration-300"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => toast.info("Device management coming soon!")}
        >
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-500/10">
              <Smartphone className="h-5 w-5 text-indigo-500" />
            </div>
            <div>
              <h4 className="text-foreground font-medium">Device Management</h4>
              <p className="text-sm text-muted-foreground">Manage connected devices and sessions</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </motion.div>
      </div>
    </div>
  );
};

// Helper function to get user data
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
      provider: "LinkedIn",
      bio: externalProfile.bio || ""
    };
  }

  // Default to regular user data
  return {
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    profileImageUrl: user.imageUrl,
    email: user.primaryEmailAddress?.emailAddress,
    username: user.username || "",
    provider: "Email",
    bio: user.unsafeMetadata?.bio || ""
  };
};

export default UserProfile;
