'use client';

import { useState } from 'react';
import Link from 'next/link';
import { registerAction } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, Mail, Lock, User, Building2, BadgeCheck, AlertCircle } from 'lucide-react';
import { UserRole } from '@/lib/types/database';

export default function RegisterPage() {
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const res = await registerAction(formData);
    if (res?.error) {
      setError(res.error);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
            <GraduationCap className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">IT Dept Portal</span>
        </Link>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create your account</h2>
        <p className="mt-1 text-xs text-slate-500">
          Join the department portal to answer surveys and submit feedback.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6 sm:p-8 space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form action={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-xs">Full Name *</Label>
                <div className="relative">
                  <User className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    placeholder="e.g. Jordan Miller"
                    className="pl-9 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs">Institutional Email *</Label>
                <div className="relative">
                  <Mail className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="jmiller@itdept.edu"
                    className="pl-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="roleId" className="text-xs">Role</Label>
                  <select
                    id="roleId"
                    name="roleId"
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <option value="STUDENT">Student</option>
                    <option value="IT_PROFESSOR">IT Professor</option>
                    <option value="IT_OFFICER">IT Officer</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="idNumber" className="text-xs">ID Number</Label>
                  <Input
                    id="idNumber"
                    name="idNumber"
                    type="text"
                    placeholder="STU-2026-112"
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="department" className="text-xs">Department / Program</Label>
                <div className="relative">
                  <Building2 className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                  <Input
                    id="department"
                    name="department"
                    type="text"
                    defaultValue="Information Technology"
                    className="pl-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs">Password *</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    placeholder="••••••••••••"
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-xs">Confirm *</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    placeholder="••••••••••••"
                    className="text-xs"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold h-10"
              >
                Register & Enter Portal
              </Button>
            </form>

            <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-semibold text-blue-600 hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

