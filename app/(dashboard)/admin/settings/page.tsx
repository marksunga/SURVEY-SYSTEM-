'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Settings,
  Shield,
  Database,
  Bell,
  Eye,
  EyeOff,
  CheckCircle2,
  Lock,
  Globe,
  Mail,
  Clock,
  Save,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react'

export default function SettingsPage() {
  const [showEncKey, setShowEncKey] = useState(false)
  const [savingGeneral, setSavingGeneral] = useState(false)
  const [savingNotif, setSavingNotif] = useState(false)
  const [savedGeneral, setSavedGeneral] = useState(false)
  const [savedNotif, setSavedNotif] = useState(false)

  const [generalSettings, setGeneralSettings] = useState({
    systemName: 'IT Department Feedback and Survey System',
    departmentName: 'Information Technology Department',
    institutionName: 'IT University',
    supportEmail: 'support@itdept.edu',
    maxSurveysPerUser: '10',
    sessionTimeoutMinutes: '60',
    maxFileUploadMB: '5',
  })

  const [notifSettings, setNotifSettings] = useState({
    enableEmailNotifications: true,
    enableInAppNotifications: true,
    reminderDaysBefore: '3',
    maxNotificationsPerUser: '50',
    autoDeleteReadAfterDays: '30',
  })

  const [securitySettings] = useState({
    encryptionAlgorithm: 'AES-256-GCM',
    keyManagementStatus: '32-Byte Master Key Loaded in Server Environment',
    keySource: 'FEEDBACK_ENCRYPTION_KEY',
    rlsEnabled: true,
    auditLogsEnabled: true,
    anonymousProtection: true,
    maxLoginAttempts: '5',
    jwtExpiry: '7 days',
    rateLimitPerMinute: '60',
  })

  async function handleSaveGeneral() {
    setSavingGeneral(true)
    await new Promise(r => setTimeout(r, 1000))
    setSavingGeneral(false)
    setSavedGeneral(true)
    setTimeout(() => setSavedGeneral(false), 3000)
  }

  async function handleSaveNotifications() {
    setSavingNotif(true)
    await new Promise(r => setTimeout(r, 1000))
    setSavingNotif(false)
    setSavedNotif(true)
    setTimeout(() => setSavedNotif(false), 3000)
  }

  return (
    <div className="space-y-6">
      {/* Header - School Institutional Identity */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-[#EAF2F8] border border-[#D1E3EC]">
          <Settings className="w-6 h-6 text-[#4682A9]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">System Settings</h1>
          <p className="text-xs sm:text-sm text-slate-500">Configure global system parameters and security policies</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="bg-white border border-slate-200">
          <TabsTrigger value="general" className="gap-2 data-[state=active]:bg-[#EAF2F8] data-[state=active]:text-[#2C5E7D] data-[state=active]:font-semibold">
            <Globe className="w-4 h-4" /> General
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2 data-[state=active]:bg-[#EAF2F8] data-[state=active]:text-[#2C5E7D] data-[state=active]:font-semibold">
            <Shield className="w-4 h-4" /> Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2 data-[state=active]:bg-[#EAF2F8] data-[state=active]:text-[#2C5E7D] data-[state=active]:font-semibold">
            <Bell className="w-4 h-4" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="database" className="gap-2 data-[state=active]:bg-[#EAF2F8] data-[state=active]:text-[#2C5E7D] data-[state=active]:font-semibold">
            <Database className="w-4 h-4" /> Database
          </TabsTrigger>
        </TabsList>

        {/* ── GENERAL ── */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">General Configuration</CardTitle>
              <CardDescription>Basic system identity and operational limits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>System Name</Label>
                  <Input
                    value={generalSettings.systemName}
                    onChange={e => setGeneralSettings(s => ({ ...s, systemName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Department Name</Label>
                  <Input
                    value={generalSettings.departmentName}
                    onChange={e => setGeneralSettings(s => ({ ...s, departmentName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Institution Name</Label>
                  <Input
                    value={generalSettings.institutionName}
                    onChange={e => setGeneralSettings(s => ({ ...s, institutionName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Mail className="w-3 h-3" /> Support Email</Label>
                  <Input
                    type="email"
                    value={generalSettings.supportEmail}
                    onChange={e => setGeneralSettings(s => ({ ...s, supportEmail: e.target.value }))}
                  />
                </div>
              </div>

              <hr className="border-slate-100" />
              <h3 className="font-medium text-sm text-slate-700">Operational Limits</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Clock className="w-3 h-3" /> Session Timeout (min)</Label>
                  <Input
                    type="number"
                    min="5"
                    max="1440"
                    value={generalSettings.sessionTimeoutMinutes}
                    onChange={e => setGeneralSettings(s => ({ ...s, sessionTimeoutMinutes: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Surveys / User</Label>
                  <Input
                    type="number"
                    min="1"
                    value={generalSettings.maxSurveysPerUser}
                    onChange={e => setGeneralSettings(s => ({ ...s, maxSurveysPerUser: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Upload Size (MB)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="50"
                    value={generalSettings.maxFileUploadMB}
                    onChange={e => setGeneralSettings(s => ({ ...s, maxFileUploadMB: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveGeneral} disabled={savingGeneral} className="gap-2 bg-[#4682A9] hover:bg-[#386B8C] text-white shadow-xs">
                  {savingGeneral ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : savedGeneral ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {savingGeneral ? 'Saving…' : savedGeneral ? 'Saved!' : 'Save General Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── SECURITY ── */}
        <TabsContent value="security" className="space-y-4">
          {/* Encryption */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-600" /> Encryption Configuration
              </CardTitle>
              <CardDescription>AES-256-GCM is used to encrypt all sensitive feedback content before database storage.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Encryption Algorithm</Label>
                  <div className="flex items-center gap-2">
                    <Input value={securitySettings.encryptionAlgorithm} readOnly className="bg-slate-50 font-mono" />
                    <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50 whitespace-nowrap">Active</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Key Storage & Isolation</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={securitySettings.keyManagementStatus}
                      readOnly
                      className="bg-slate-50 font-mono text-xs text-slate-700"
                    />
                    <Badge variant="outline" className="text-blue-700 border-blue-300 bg-blue-50 whitespace-nowrap">
                      Server-Side Only
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">
                    Configured via <code className="bg-slate-100 px-1 rounded">FEEDBACK_ENCRYPTION_KEY</code> on the server. Secret keys are strictly decoupled from client browsers.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Auth & Access */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" /> Authentication & Access Control
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="space-y-2">
                  <Label>Max Login Attempts</Label>
                  <Input value={securitySettings.maxLoginAttempts} readOnly className="bg-slate-50" />
                </div>
                <div className="space-y-2">
                  <Label>JWT Expiry</Label>
                  <Input value={securitySettings.jwtExpiry} readOnly className="bg-slate-50" />
                </div>
                <div className="space-y-2">
                  <Label>Rate Limit (req/min)</Label>
                  <Input value={securitySettings.rateLimitPerMinute} readOnly className="bg-slate-50" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { label: 'Row Level Security (RLS)', active: securitySettings.rlsEnabled, desc: 'Supabase RLS enforced on all tables' },
                  { label: 'Audit Logging', active: securitySettings.auditLogsEnabled, desc: 'All sensitive actions logged' },
                  { label: 'Anonymous Protection', active: securitySettings.anonymousProtection, desc: 'Zero-knowledge response storage' },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50">
                    <CheckCircle2 className={`w-5 h-5 mt-0.5 shrink-0 ${item.active ? 'text-green-500' : 'text-slate-300'}`} />
                    <div>
                      <p className="text-sm font-medium text-slate-800">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-800">
                  Security settings are managed via environment variables and Supabase project configuration. Changes here are for display/documentation purposes only. For production changes, update <code className="bg-amber-100 px-1 rounded">.env.local</code> and your Supabase project dashboard.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── NOTIFICATIONS ── */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-600" /> Notification Policy
              </CardTitle>
              <CardDescription>Configure how and when notifications are sent to users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {[
                  {
                    key: 'enableInAppNotifications',
                    label: 'In-App Notifications',
                    desc: 'Show notification bell and notification center in the dashboard',
                  },
                  {
                    key: 'enableEmailNotifications',
                    label: 'Email Notifications',
                    desc: 'Send email reminders for surveys (requires SMTP configuration)',
                  },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                    <button
                      onClick={() =>
                        setNotifSettings(s => ({
                          ...s,
                          [item.key]: !s[item.key as keyof typeof s],
                        }))
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        notifSettings[item.key as keyof typeof notifSettings] ? 'bg-[#4682A9]' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifSettings[item.key as keyof typeof notifSettings] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>

              <hr className="border-slate-100" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Reminder Days Before Deadline</Label>
                  <Input
                    type="number"
                    min="1"
                    max="30"
                    value={notifSettings.reminderDaysBefore}
                    onChange={e => setNotifSettings(s => ({ ...s, reminderDaysBefore: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Notifications / User</Label>
                  <Input
                    type="number"
                    min="10"
                    value={notifSettings.maxNotificationsPerUser}
                    onChange={e => setNotifSettings(s => ({ ...s, maxNotificationsPerUser: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Auto-delete Read After (days)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={notifSettings.autoDeleteReadAfterDays}
                    onChange={e => setNotifSettings(s => ({ ...s, autoDeleteReadAfterDays: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveNotifications} disabled={savingNotif} className="gap-2 bg-[#4682A9] hover:bg-[#386B8C] text-white shadow-xs">
                  {savingNotif ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : savedNotif ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {savingNotif ? 'Saving…' : savedNotif ? 'Saved!' : 'Save Notification Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── DATABASE ── */}
        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-600" /> Database Information
              </CardTitle>
              <CardDescription>Supabase PostgreSQL connection status and table overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Database Provider</Label>
                  <Input value="Supabase PostgreSQL" readOnly className="bg-slate-50" />
                </div>
                <div className="space-y-2">
                  <Label>Connection Mode</Label>
                  <div className="flex items-center gap-2">
                    <Input value="Mock Adapter (Demo)" readOnly className="bg-slate-50" />
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200 whitespace-nowrap">Demo</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Supabase URL (env: NEXT_PUBLIC_SUPABASE_URL)</Label>
                  <Input value="••••••••••••••••••••••••••••••" readOnly className="bg-slate-50 font-mono text-xs" />
                </div>
                <div className="space-y-2">
                  <Label>Anon Key (env: NEXT_PUBLIC_SUPABASE_ANON_KEY)</Label>
                  <Input value="••••••••••••••••••••••••••••••" readOnly className="bg-slate-50 font-mono text-xs" />
                </div>
              </div>

              <hr className="border-slate-100" />
              <h3 className="font-medium text-sm text-[#0F172A]">Database Tables (11 active)</h3>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  'profiles', 'roles', 'surveys', 'survey_questions',
                  'survey_responses', 'response_answers', 'feedback',
                  'qr_codes', 'notifications', 'audit_logs',
                  'survey_participation_receipts',
                ].map(table => (
                  <div key={table} className="flex items-center gap-2 p-2 rounded-md bg-[#F3F5F7] border border-slate-200">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <code className="text-xs text-slate-700">{table}</code>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>Production Setup:</strong> Replace environment variable placeholders in <code className="bg-blue-100 px-1 rounded">.env.local</code> with your actual Supabase project URL and keys, then run <code className="bg-blue-100 px-1 rounded">supabase/migrations/20261105000000_init_schema.sql</code> in your Supabase SQL editor and seed with <code className="bg-blue-100 px-1 rounded">supabase/seed.sql</code>.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

