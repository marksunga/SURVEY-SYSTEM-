'use client';

import { useState } from 'react';
import { Profile } from '@/lib/types/database';
import { updateProfileAction, updatePasswordAction } from '@/app/actions/auth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Building2, Shield, KeyRound, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export function ProfileClient({ user }: { user: Profile }) {
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  async function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccess(null);
    setProfileError(null);

    const formData = new FormData(e.currentTarget);
    const res = await updateProfileAction(formData);

    if (res?.error) {
      setProfileError(res.error);
    } else {
      setProfileSuccess('Profile details successfully updated!');
      setTimeout(() => setProfileSuccess(null), 3500);
    }
    setProfileSaving(false);
  }

  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordSuccess(null);
    setPasswordError(null);

    const formData = new FormData(e.currentTarget);
    const form = e.currentTarget;
    const res = await updatePasswordAction(formData);

    if (res?.error) {
      setPasswordError(res.error);
    } else {
      setPasswordSuccess(res?.message || 'Password changed successfully!');
      form.reset();
      setTimeout(() => setPasswordSuccess(null), 3500);
    }
    setPasswordSaving(false);
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
          {profileSuccess && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-xs">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  defaultValue={user.full_name}
                  required
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

            <Button
              type="submit"
              size="sm"
              disabled={profileSaving}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs"
            >
              {profileSaving ? (
                'Saving...'
              ) : (
                <span className="flex items-center gap-1.5">
                  <Save className="h-3.5 w-3.5" />
                  Save Profile Changes
                </span>
              )}
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
          {passwordSuccess && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="newPassword" className="text-xs">New Password</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  placeholder="Re-enter new password"
                  className="text-xs"
                />
              </div>
            </div>

            <Button
              type="submit"
              size="sm"
              variant="outline"
              disabled={passwordSaving}
              className="text-xs"
            >
              {passwordSaving ? 'Updating Password...' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
