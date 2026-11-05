import { getCurrentUser } from '@/lib/auth/session';
import { updateProfileAction } from '@/app/actions/auth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Building2, BadgeCheck, Shield, KeyRound, CheckCircle2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  async function handleProfileUpdate(formData: FormData) {
    'use server';
    await updateProfileAction(formData);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Profile & Account</h1>
        <p className="text-xs text-slate-500">
          Manage your personal details, institutional identifiers, and security credentials.
        </p>
      </div>

      {/* Account Overview Header */}
      <Card className="border-slate-200">
        <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold shadow-md">
              {user.full_name.slice(0, 2).toUpperCase()}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{user.full_name}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 uppercase">
                  {user.role_id.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-500">{user.email}</p>
              <div className="text-[11px] text-slate-400">
                Member since {formatDate(user.created_at)} • Status:{' '}
                <span className="font-semibold text-emerald-600">Active</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Details Form */}
      <Card className="border-slate-200">
        <CardHeader className="p-6">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <User className="h-4 w-4 text-blue-600" />
            <span>Profile Details</span>
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Update your displayed institutional name and department affiliation.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 pt-0 space-y-4">
          <form action={handleProfileUpdate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-xs">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  defaultValue={user.full_name}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs">Email Address (Read-only)</Label>
                <Input
                  id="email"
                  value={user.email}
                  disabled
                  className="text-xs bg-slate-50 text-slate-500 cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="department" className="text-xs">Department / Unit</Label>
                <Input
                  id="department"
                  name="department"
                  defaultValue={user.department}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="idNumber" className="text-xs">Institutional ID Number</Label>
                <Input
                  id="idNumber"
                  name="idNumber"
                  defaultValue={user.id_number || ''}
                  className="text-xs"
                />
              </div>
            </div>

            <Button type="submit" size="sm" className="bg-blue-600 text-white text-xs">
              Save Profile Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Security Credentials Card */}
      <Card className="border-slate-200">
        <CardHeader className="p-6">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-slate-700" />
            <span>Password & Security</span>
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Update your authentication password and review security policies.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 pt-0 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="currPass" className="text-xs">Current Password</Label>
              <Input id="currPass" type="password" placeholder="••••••••••••" className="text-xs" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="newPass" className="text-xs">New Password</Label>
              <Input id="newPass" type="password" placeholder="••••••••••••" className="text-xs" />
            </div>
          </div>

          <Button type="button" size="sm" variant="outline" className="text-xs">
            Update Password
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

