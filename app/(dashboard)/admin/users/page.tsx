'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Users, UserPlus, Search, Shield, Check, X, AlertCircle } from 'lucide-react';
import { updateUserRoleAction, toggleUserActiveAction, createAdminUserAction } from '@/app/actions/users';
import { Profile, UserRole } from '@/lib/types/database';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/users')
      .then((res) => res.json())
      .then((data) => setUsers(data.users || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  async function handleRoleChange(userId: string, newRole: UserRole) {
    await updateUserRoleAction(userId, newRole);
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role_id: newRole } : u))
    );
  }

  async function handleToggleActive(userId: string) {
    const res = await toggleUserActiveAction(userId);
    if (res?.success) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_active: res.is_active } : u))
      );
    }
  }

  async function handleCreateUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    const email = formData.get('email') as string;
    const fullName = formData.get('fullName') as string;
    const roleId = formData.get('roleId') as UserRole;
    const department = formData.get('department') as string;
    const idNumber = formData.get('idNumber') as string;

    const res = await createAdminUserAction({ email, fullName, roleId, department, idNumber });
    if (res?.error) {
      setError(res.error);
    } else if (res?.user) {
      setUsers((prev) => [res.user, ...prev]);
      setDialogOpen(false);
      form.reset();
    }
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.id_number && u.id_number.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = selectedRole === 'ALL' || u.role_id === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Account Management</h1>
          <p className="text-xs text-slate-500">
            Control institutional user accounts, role-based authorization, and active status.
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white text-xs">
              <UserPlus className="h-4 w-4 mr-1.5" />
              Add User Account
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">Create New User Account</DialogTitle>
            </DialogHeader>

            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3 pt-2">
              <div className="space-y-1">
                <Label className="text-xs">Full Name *</Label>
                <Input name="fullName" required placeholder="e.g. Elena Rostova" className="text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Email Address *</Label>
                <Input name="email" type="email" required placeholder="elena@itdept.edu" className="text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Assigned Role</Label>
                  <select
                    name="roleId"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                  >
                    <option value="STUDENT">Student</option>
                    <option value="IT_PROFESSOR">IT Professor</option>
                    <option value="IT_OFFICER">IT Officer</option>
                    <option value="ADMINISTRATOR">Administrator</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">ID Number</Label>
                  <Input name="idNumber" placeholder="STU-2026-99" className="text-xs" />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Department</Label>
                <Input name="department" defaultValue="Information Technology" className="text-xs" />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setDialogOpen(false)} className="text-xs">
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-blue-600 text-white text-xs">
                  Create Account
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
          <Input
            placeholder="Search by name, email, or institutional ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs w-full bg-white"
          />
        </div>

        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="flex h-10 rounded-md border border-input bg-white px-3 py-2 text-xs text-slate-700 w-full sm:w-48"
        >
          <option value="ALL">All Roles</option>
          <option value="STUDENT">Student</option>
          <option value="IT_PROFESSOR">IT Professor</option>
          <option value="IT_OFFICER">IT Officer</option>
          <option value="ADMINISTRATOR">Administrator</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5 pl-4">User</th>
                <th className="p-3.5">Institutional ID</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">System Role</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 pr-4 text-right">Access Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 text-xs">
                    Loading accounts...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 text-xs">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 pl-4">
                      <div className="font-semibold text-slate-900">{u.full_name}</div>
                      <div className="text-[11px] text-slate-400">{u.email}</div>
                    </td>
                    <td className="p-3.5 font-mono text-slate-600">
                      {u.id_number || 'N/A'}
                    </td>
                    <td className="p-3.5 text-slate-600">{u.department}</td>
                    <td className="p-3.5">
                      <select
                        value={u.role_id}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                        className="h-8 rounded border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="STUDENT">STUDENT</option>
                        <option value="IT_PROFESSOR">IT PROFESSOR</option>
                        <option value="IT_OFFICER">IT OFFICER</option>
                        <option value="ADMINISTRATOR">ADMINISTRATOR</option>
                      </select>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.is_active
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {u.is_active ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="p-3.5 pr-4 text-right">
                      <Button
                        type="button"
                        variant={u.is_active ? 'outline' : 'default'}
                        size="sm"
                        onClick={() => handleToggleActive(u.id)}
                        className={`h-7 text-xs px-2.5 ${
                          u.is_active
                            ? 'text-rose-600 border-rose-200 hover:bg-rose-50'
                            : 'bg-emerald-600 text-white hover:bg-emerald-500'
                        }`}
                      >
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

