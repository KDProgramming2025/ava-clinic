import { motion } from 'motion/react';
import { Settings, User, Lock, Bell, Globe, Palette, Mail } from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Switch } from '../../ui/switch';
import { Separator } from '../../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { toast } from 'sonner@2.0.3';

export function SettingsManagement() {
  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage system settings and preferences</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="general">
            <Settings className="w-4 h-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="w-4 h-4 mr-2" />
            Appearance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <Card className="p-6 border-0 shadow-lg">
            <h3 className="mb-6 text-gray-900">General Settings</h3>
            <div className="space-y-6">
              <div>
                <Label htmlFor="clinic-name">Clinic Name</Label>
                <Input
                  id="clinic-name"
                  defaultValue="Beauty Implant"
                  className="mt-2 rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="clinic-email">Clinic Email</Label>
                <Input
                  id="clinic-email"
                  type="email"
                  defaultValue="info@beautyimplant.com"
                  className="mt-2 rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="clinic-phone">Clinic Phone</Label>
                <Input
                  id="clinic-phone"
                  defaultValue="+1 (555) 123-4567"
                  className="mt-2 rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="clinic-address">Clinic Address</Label>
                <Input
                  id="clinic-address"
                  defaultValue="123 Beauty Street, Medical District, City 12345"
                  className="mt-2 rounded-xl"
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Online Booking</Label>
                  <p className="text-gray-600">Allow clients to book appointments online</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-Confirm Bookings</Label>
                  <p className="text-gray-600">Automatically confirm new bookings</p>
                </div>
                <Switch />
              </div>
              <Button
                onClick={handleSave}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl"
              >
                Save Changes
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="mt-6">
          <Card className="p-6 border-0 shadow-lg">
            <h3 className="mb-6 text-gray-900">Admin Profile</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg">
                  <User className="w-10 h-10" />
                </div>
                <Button variant="outline" className="rounded-xl">
                  Change Photo
                </Button>
              </div>
              <div>
                <Label htmlFor="admin-name">Full Name</Label>
                <Input
                  id="admin-name"
                  defaultValue="Admin User"
                  className="mt-2 rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="admin-email">Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  defaultValue="admin@beautyimplant.com"
                  className="mt-2 rounded-xl"
                />
              </div>
              <Separator />
              <h3 className="text-gray-900">Change Password</h3>
              <div>
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  className="mt-2 rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  className="mt-2 rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  className="mt-2 rounded-xl"
                />
              </div>
              <Button
                onClick={handleSave}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl"
              >
                Update Profile
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card className="p-6 border-0 shadow-lg">
            <h3 className="mb-6 text-gray-900">Notification Preferences</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-gray-600">Receive email notifications for new bookings</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Booking Reminders</Label>
                  <p className="text-gray-600">Get reminders about upcoming appointments</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>New Message Alerts</Label>
                  <p className="text-gray-600">Notify when new messages arrive</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Client Updates</Label>
                  <p className="text-gray-600">Updates about client activities</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Marketing Updates</Label>
                  <p className="text-gray-600">News and updates about the platform</p>
                </div>
                <Switch />
              </div>
              <Button
                onClick={handleSave}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl"
              >
                Save Preferences
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="mt-6">
          <Card className="p-6 border-0 shadow-lg">
            <h3 className="mb-6 text-gray-900">Appearance Settings</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Dark Mode</Label>
                  <p className="text-gray-600">Use dark theme for the admin panel</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Compact View</Label>
                  <p className="text-gray-600">Show more content in less space</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Sidebar Always Open</Label>
                  <p className="text-gray-600">Keep the sidebar expanded by default</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div>
                <Label>Primary Color</Label>
                <div className="grid grid-cols-6 gap-3 mt-3">
                  {['#ec4899', '#a855f7', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'].map((color) => (
                    <button
                      key={color}
                      className="w-12 h-12 rounded-xl shadow-lg hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <Button
                onClick={handleSave}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl"
              >
                Apply Changes
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
