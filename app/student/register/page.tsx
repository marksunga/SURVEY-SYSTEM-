'use client';

import { useState } from 'react';
import Link from 'next/link';
import { studentRegisterAction } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { GraduationCap, Lock, Mail, User, Building, AlertCircle, ArrowRight, ShieldCheck, BadgeCheck } from 'lucide-react';

export default function StudentRegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [department, setDepartment] = useState('Information Technology');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const res = await studentRegisterAction(formData);
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <div className="h-11 w-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
            <GraduationCap className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">IT Dept Portal</span>
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Student Account Registration
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Create your verified student account to participate in department surveys and feedback.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
                <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Assigned Role: Student</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Self-Enrollment</span>
            </div>
            <CardTitle className="text-lg text-slate-900 mt-2">Create Student Account</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Only student accounts can be self-registered. Administrator accounts are strictly provisioned.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div
                role="alert"
                className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5"
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-600 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <form action={handleSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <Label htmlFor="fullName" className="text-xs font-semibold text-slate-700">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                  <Input
                    id="fullName"
                    name="fullName"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-9 text-xs h-10 border-slate-300"
                    placeholder="e.g. Samantha Hayes"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                  Institutional Student Email
                </Label>
                <div className="relative">
                  <Mail className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 text-xs h-10 border-slate-300"
                    placeholder="student@itdept.edu"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="idNumber" className="text-xs font-semibold text-slate-700">
                    Student ID Number
                  </Label>
                  <Input
                    id="idNumber"
                    name="idNumber"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    className="text-xs h-10 border-slate-300"
                    placeholder="STU-2026-001"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="department" className="text-xs font-semibold text-slate-700">
                    Department
                  </Label>
                  <div className="relative">
                    <Building className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                    <Input
                      id="department"
                      name="department"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="pl-9 text-xs h-10 border-slate-300"
                      placeholder="Information Technology"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="password" className="text-xs font-semibold text-slate-700">
                  Create Password (minimum 6 characters)
                </Label>
                <div className="relative">
                  <Lock className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 text-xs h-10 border-slate-300"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold h-11 min-h-[44px] cursor-pointer shadow-sm transition-all mt-2"
              >
                {loading ? 'Creating Student Account...' : 'Complete Student Registration'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </form>

            <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
              Already have an account?{' '}
              <Link
                href="/student/login"
                className="font-semibold text-blue-600 hover:underline min-h-[44px] inline-flex items-center py-2 px-1"
              >
                Sign In to Student Portal
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

