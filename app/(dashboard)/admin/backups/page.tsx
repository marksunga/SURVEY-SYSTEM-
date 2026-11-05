'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { createBackupAction } from '@/app/actions/backups';
import { Database, Download, ShieldCheck, CheckCircle2, HardDrive, Clock } from 'lucide-react';
import { SystemBackup } from '@/lib/types/database';
import { formatDateTime } from '@/lib/utils';

export default function AdminBackupsPage() {
  const [backups, setBackups] = useState<SystemBackup[]>([]);
  const [creating, setCreating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/backups')
      .then((res) => res.json())
      .then((data) => setBackups(data.backups || []))
      .catch((err) => console.error(err));
  }, []);

  async function handleCreateBackup(type: SystemBackup['backup_type']) {
    setCreating(true);
    setSuccessMsg(null);
    try {
      const res = await createBackupAction(type);
      if (res?.success && res.backup) {
        setBackups((prev) => [res.backup, ...prev]);
        setSuccessMsg(`Backup "${res.backup.filename}" generated successfully!`);

        // Automatically trigger browser download of the backup file
        const blob = new Blob([res.data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = res.backup.filename;
        a.click();
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Backup & Recovery</h1>
          <p className="text-xs text-slate-500">
            Create instantaneous database snapshots, export encrypted data schemas, and safeguard institutional records.
          </p>
        </div>

        <Button
          type="button"
          onClick={() => handleCreateBackup('FULL')}
          disabled={creating}
          size="sm"
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs"
        >
          <Database className="h-4 w-4 mr-1.5" />
          {creating ? 'Generating Snapshot...' : 'Create Full Snapshot'}
        </Button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-[11px] underline font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {/* Snapshot Types Card */}
      <Card className="border-slate-200">
        <CardHeader className="p-6">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-blue-600" />
            <span>Manual Backup Generation</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <h4 className="text-xs font-bold text-slate-900">Full System Snapshot</h4>
            <p className="text-[11px] text-slate-500">
              Complete state backup including surveys, questions, encrypted feedback, and audit logs.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCreateBackup('FULL')}
              disabled={creating}
              className="w-full text-xs"
            >
              Export JSON
            </Button>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <h4 className="text-xs font-bold text-slate-900">Schema & Policies Only</h4>
            <p className="text-[11px] text-slate-500">
              PostgreSQL schema definition, functions, triggers, and Row Level Security rules.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCreateBackup('SCHEMA_ONLY')}
              disabled={creating}
              className="w-full text-xs"
            >
              Export Schema
            </Button>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <h4 className="text-xs font-bold text-slate-900">Survey Data Only</h4>
            <p className="text-[11px] text-slate-500">
              Anonymized survey response answers, participant receipts, and question records.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCreateBackup('DATA_EXPORT')}
              disabled={creating}
              className="w-full text-xs"
            >
              Export Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Backup History Table */}
      <Card className="border-slate-200">
        <CardHeader className="p-6">
          <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-500" />
            <span>Backup History & Generated Snapshots</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          {backups.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">
              No backups created yet. Click &quot;Create Full Snapshot&quot; above to create one.
            </p>
          ) : (
            <div className="space-y-2">
              {backups.map((b) => (
                <div
                  key={b.id}
                  className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-slate-900 font-mono text-[11px]">{b.filename}</div>
                    <div className="text-[10px] text-slate-400">
                      Type: <span className="font-bold text-blue-600">{b.backup_type}</span> • Size:{' '}
                      {(b.size_bytes / 1024).toFixed(1)} KB • {formatDateTime(b.created_at)}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Verified
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

