'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Users,
  UserPlus,
  Search,
  Shield,
  GraduationCap,
  Check,
  X,
  AlertCircle,
  Trash2,
  CheckCircle2,
  XCircle,
  Filter,
} from 'lucide-react';
import { toggleUserActiveAction, createAdminUserAction, deleteUserAction } from '@/app/actions/users';
import { Profile } from '@/lib/types/database';

type AccountTab = 'ADMINISTRATORS' | 'STUDENTS';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AccountTab>('ADMINISTRATORS');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DEACTIVATED'>('ALL');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<Profile | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.users) {
        setUsers(data.users);
      }
      if (data.currentUserId) {
        setCurrentUserId(data.currentUserId);
      }
    } catch (err) {
      console.error('Failed to load user accounts:', err);
    } finally {
      setLoading(false);
    }
  }

  // Split users strictly by database role
  const administratorAccounts = useMemo(() => {
    return users.filter((u) => u.role_id === 'ADMINISTRATOR');
  }, [users]);

  const studentAccounts = useMemo(() => {
    return users.filter((u) => u.role_id === 'STUDENT');
  }, [users]);

  // Filter accounts belonging exclusively to the active tab
  const activeTabAccounts = useMemo(() => {
    const pool = activeTab === 'ADMINISTRATORS' ? administratorAccounts : studentAccounts;
    const term = searchTerm.toLowerCase().trim();

    return pool.filter((u) => {
      const matchesSearch =
        !term ||
        u.full_name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        (u.id_number && u.id_number.toLowerCase().includes(term)) ||
        (u.department && u.department.toLowerCase().includes(term));

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && u.is_active) ||
        (statusFilter === 'DEACTIVATED' && !u.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [activeTab, administratorAccounts, studentAccounts, searchTerm, statusFilter]);

  async function handleToggleActive(userId: string) {
    const res = await toggleUserActiveAction(userId);
    if (res?.success) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_active: res.is_active } : u))
      );
    } else if (res?.error) {
      alert(res.error);
    }
  }

  async function handleCreateUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setCreating(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const email = formData.get('email') as string;
    const fullName = formData.get('fullName') as string;
    const department = formData.get('department') as string;
    const idNumber = formData.get('idNumber') as string;

    const res = await createAdminUserAction({
      email,
      fullName,
      category: activeTab === 'ADMINISTRATORS' ? 'ADMINISTRATOR' : 'STUDENT',
      department,
      idNumber,
    });

    setCreating(false);

    if (res?.error) {
      setError(res.error);
    } else if (res?.user) {
      setUsers((prev) => [res.user, ...prev]);
      setSuccessMessage(
        `${activeTab === 'ADMINISTRATORS' ? 'Administrator' : 'Student'} account for "${fullName}" created successfully.`
      );
      setDialogOpen(false);
      form.reset();
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  }

  async function handleConfirmDeleteUser() {
    if (!userToDelete) return;
    setDeleting(true);
    const res = await deleteUserAction(userToDelete.id);
    if (res?.success) {
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setUserToDelete(null);
    } else if (res?.error) {
      alert(res.error);
    }
    setDeleting(false);
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Account Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage institutional Administrator and Student accounts with strict role separation and access control.
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setError(null); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-[#4682A9] hover:bg-[#386B8C] text-white text-xs min-h-[40px] shadow-xs">
              <UserPlus className="h-4 w-4 mr-1.5" />
              {activeTab === 'ADMINISTRATORS' ? 'Add Administrator' : 'Add Student'}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                {activeTab === 'ADMINISTRATORS' ? (
                  <>
                    <Shield className="h-5 w-5 text-[#4682A9]" />
                    <span>Create Administrator Account</span>
                  </>
                ) : (
                  <>
                    <GraduationCap className="h-5 w-5 text-[#4682A9]" />
                    <span>Create Student Account</span>
                  </>
                )}
              </DialogTitle>
              <p className="text-xs text-slate-500 mt-1">
                {activeTab === 'ADMINISTRATORS'
                  ? 'Provision a verified administrator account. The Administrator role is permanently assigned.'
                  : 'Provision an enrolled student account. The Student role is permanently assigned.'}
              </p>
            </DialogHeader>

            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3.5 pt-2">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Full Name *</Label>
                <Input
                  name="fullName"
                  required
                  placeholder={activeTab === 'ADMINISTRATORS' ? 'e.g. Dr. Arthur Pendelton' : 'e.g. Elena Rostova'}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Institutional Email *</Label>
                <Input
                  name="email"
                  type="email"
                  required
                  placeholder={activeTab === 'ADMINISTRATORS' ? 'admin.pendelton@itdept.edu' : 'student.elena@itdept.edu'}
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-700">
                    {activeTab === 'ADMINISTRATORS' ? 'Institutional ID *' : 'Student ID *'}
                  </Label>
                  <Input
                    name="idNumber"
                    required
                    placeholder={activeTab === 'ADMINISTRATORS' ? 'ADM-2026-04' : 'STU-2026-145'}
                    className="text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-700">Department</Label>
                  <Input
                    name="department"
                    defaultValue={activeTab === 'ADMINISTRATORS' ? 'IT Administration' : 'Information Technology'}
                    className="text-xs"
                  />
                </div>
              </div>

              {/* Automatic Role Notice - No Dropdown Allowed */}
              <div className="p-3 rounded-lg border bg-slate-50 border-slate-200 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Assigned System Role:</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] flex items-center gap-1.5 ${
                    activeTab === 'ADMINISTRATORS'
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  {activeTab === 'ADMINISTRATORS' ? (
                    <>
                      <Shield className="h-3 w-3" />
                      ADMINISTRATOR
                    </>
                  ) : (
                    <>
                      <GraduationCap className="h-3 w-3" />
                      STUDENT
                    </>
                  )}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 italic">
                * Roles are immutably tied to the account category and cannot be manually altered.
              </p>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDialogOpen(false)}
                  className="text-xs min-h-[36px]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={creating}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs min-h-[36px]"
                >
                  {creating ? 'Creating Account...' : 'Create Account'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Two Prominent Account Selection Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex items-center gap-2">
          {/* TAB 1: ADMINISTRATORS */}
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'ADMINISTRATORS'}
            onClick={() => {
              setActiveTab('ADMINISTRATORS');
              setSearchTerm('');
            }}
            className={`flex items-center gap-2.5 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all min-h-[46px] select-none ${
              activeTab === 'ADMINISTRATORS'
                ? 'border-[#4682A9] text-[#2C5E7D] bg-[#EAF2F8]/60 rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-[#0F172A] hover:bg-[#F3F5F7] rounded-t-lg'
            }`}
          >
            <Shield className={`h-4 w-4 ${activeTab === 'ADMINISTRATORS' ? 'text-[#4682A9]' : 'text-slate-400'}`} />
            <span>Administrators</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold transition-colors ${
                activeTab === 'ADMINISTRATORS'
                  ? 'bg-[#4682A9] text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {administratorAccounts.length}
            </span>
          </button>

          {/* TAB 2: STUDENTS */}
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'STUDENTS'}
            onClick={() => {
              setActiveTab('STUDENTS');
              setSearchTerm('');
            }}
            className={`flex items-center gap-2.5 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all min-h-[46px] select-none ${
              activeTab === 'STUDENTS'
                ? 'border-[#4682A9] text-[#2C5E7D] bg-[#EAF2F8]/60 rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-[#0F172A] hover:bg-[#F3F5F7] rounded-t-lg'
            }`}
          >
            <GraduationCap className={`h-4 w-4 ${activeTab === 'STUDENTS' ? 'text-[#4682A9]' : 'text-slate-400'}`} />
            <span>Students</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold transition-colors ${
                activeTab === 'STUDENTS'
                  ? 'bg-[#4682A9] text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {studentAccounts.length}
            </span>
          </button>
        </div>
      </div>

      {/* Search and Status Filtering Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
          <Input
            placeholder={
              activeTab === 'ADMINISTRATORS'
                ? 'Search administrators by name, email, or institutional ID...'
                : 'Search students by name, email, or student ID...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs w-full bg-white min-h-[40px]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="flex h-10 rounded-md border border-input bg-white px-3 py-2 text-xs text-slate-700 w-full sm:w-48 font-medium"
        >
          <option value="ALL">All Account Statuses</option>
          <option value="ACTIVE">Active Accounts Only</option>
          <option value="DEACTIVATED">Deactivated Accounts Only</option>
        </select>
      </div>

      {/* Account Table Component */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="p-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2 font-semibold">
            {activeTab === 'ADMINISTRATORS' ? (
              <>
                <Shield className="h-4 w-4 text-blue-600" />
                <span>Showing Administrator Accounts ({activeTabAccounts.length})</span>
              </>
            ) : (
              <>
                <GraduationCap className="h-4 w-4 text-emerald-600" />
                <span>Showing Student Accounts ({activeTabAccounts.length})</span>
              </>
            )}
          </div>
          <span className="text-[11px] text-slate-500">
            {activeTab === 'ADMINISTRATORS'
              ? 'Institutional administrators with full dashboard & authoring access'
              : 'Enrolled students with survey response & encrypted feedback privileges'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/60 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5 pl-4">Full Name</th>
                <th className="p-3.5">
                  {activeTab === 'ADMINISTRATORS' ? 'Institutional ID' : 'Student ID'}
                </th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Account Status</th>
                <th className="p-3.5 pr-4 text-right">Account Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-400 text-xs">
                    Loading account records...
                  </td>
                </tr>
              ) : activeTabAccounts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-400 text-xs space-y-1">
                    <p className="font-medium text-slate-600">
                      {activeTab === 'ADMINISTRATORS'
                        ? 'No administrator accounts match your criteria.'
                        : 'No student accounts match your criteria.'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {searchTerm ? 'Try adjusting your search query or status filter.' : 'Click Add above to provision an account.'}
                    </p>
                  </td>
                </tr>
              ) : (
                activeTabAccounts.map((u) => {
                  const isCurrentAdmin = currentUserId === u.id;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 pl-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-[10px] uppercase flex-shrink-0 ${
                              u.role_id === 'ADMINISTRATOR'
                                ? 'bg-slate-900 text-white'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {u.full_name.slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                              <span>{u.full_name}</span>
                              {isCurrentAdmin && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 font-mono text-slate-700 font-medium">
                        {u.id_number || 'N/A'}
                      </td>

                      <td className="p-3.5 text-slate-600">{u.department || 'General'}</td>

                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            u.is_active
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {u.is_active ? 'Active' : 'Deactivated'}
                        </span>
                      </td>

                      <td className="p-3.5 pr-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            type="button"
                            variant={u.is_active ? 'outline' : 'default'}
                            size="sm"
                            disabled={isCurrentAdmin}
                            onClick={() => handleToggleActive(u.id)}
                            className={`h-8 text-xs px-3 min-w-[90px] ${
                              isCurrentAdmin
                                ? 'opacity-50 cursor-not-allowed text-slate-400'
                                : u.is_active
                                ? 'text-rose-600 border-rose-200 hover:bg-rose-50'
                                : 'bg-emerald-600 text-white hover:bg-emerald-500'
                            }`}
                          >
                            {u.is_active ? 'Deactivate' : 'Activate'}
                          </Button>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={isCurrentAdmin}
                            onClick={() => setUserToDelete(u)}
                            className={`h-8 w-8 p-0 text-slate-400 ${
                              isCurrentAdmin
                                ? 'opacity-30 cursor-not-allowed'
                                : 'hover:text-rose-600 hover:bg-rose-50'
                            }`}
                            title={isCurrentAdmin ? 'Cannot delete current account' : 'Delete Account'}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Dialog for Deleting Account */}
      <Dialog open={Boolean(userToDelete)} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-rose-600" />
              <span>Confirm Account Deletion</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs text-slate-600">
            <p>
              Are you sure you want to permanently delete the{' '}
              <strong className="text-slate-900">
                {userToDelete?.role_id === 'ADMINISTRATOR' ? 'Administrator' : 'Student'}
              </strong>{' '}
              account for <strong className="text-slate-900">{userToDelete?.full_name}</strong>?
            </p>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1 font-mono text-[11px]">
              <div>Email: <span className="font-semibold text-slate-800">{userToDelete?.email}</span></div>
              <div>ID Number: <span className="font-semibold text-slate-800">{userToDelete?.id_number || 'N/A'}</span></div>
              <div>Department: <span className="font-semibold text-slate-800">{userToDelete?.department || 'N/A'}</span></div>
            </div>
            <p className="text-rose-600 font-medium">
              This action cannot be undone. All active sessions and stored access rights will be terminated immediately.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={deleting}
              onClick={() => setUserToDelete(null)}
              className="text-xs min-h-[36px]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={deleting}
              onClick={handleConfirmDeleteUser}
              className="bg-rose-600 hover:bg-rose-500 text-white text-xs min-h-[36px]"
            >
              {deleting ? 'Deleting Account...' : 'Delete Account Permanently'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
