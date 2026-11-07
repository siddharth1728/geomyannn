"use client";

import React from "react";
import { 
  X, 
  MapPin, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert,
  Navigation2
} from "lucide-react";
import { CommunityReport, ReportStatus } from "@/types/geo";
import { formatCoordinates } from "@/lib/utils/formatters";

interface ReportDetailsPanelProps {
  report: CommunityReport | null;
  onClose: () => void;
  onNavigateTo?: (report: CommunityReport) => void;
}

export function ReportDetailsPanel({
  report,
  onClose,
  onNavigateTo,
}: ReportDetailsPanelProps) {
  if (!report) return null;

  const statusConfig: Record<ReportStatus, { label: string; color: string; icon: any }> = {
    reported: { label: "Community Reported", color: "text-warning border-warning/40 bg-warning/10", icon: AlertCircle },
    verified: { label: "Verified Incident", color: "text-accent-secondary border-accent-secondary/40 bg-accent-secondary/10", icon: ShieldAlert },
    resolved: { label: "Resolved", color: "text-accent-primary border-accent-primary/40 bg-accent-primary/10", icon: CheckCircle2 },
    dismissed: { label: "Dismissed", color: "text-text-muted border-border bg-surface-muted", icon: X },
  };

  const statusInfo = statusConfig[report.status] || statusConfig.reported;
  const StatusIcon = statusInfo.icon;

  return (
    <div className="w-full max-w-sm bg-surface/95 backdrop-blur-md border border-border rounded-xl shadow-panel-glow p-4 z-20 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-2">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border flex items-center gap-1 ${statusInfo.color}`}
          >
            <StatusIcon className="w-3 h-3" />
            {statusInfo.label}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-text-muted hover:text-text-primary p-1 rounded-md"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Category & Description */}
      <div>
        <div className="text-xs font-mono uppercase text-text-muted tracking-wider">
          {report.category.replace("_", " ")}
        </div>
        <p className="text-xs text-text-primary mt-1 leading-relaxed">
          {report.description}
        </p>
      </div>

      {/* Geolocation & Telemetry */}
      <div className="bg-surface-elevated/80 border border-border rounded-lg p-2.5 flex flex-col gap-1.5 text-[11px] font-mono text-text-muted">
        <div className="flex items-center gap-2 text-text-secondary">
          <MapPin className="w-3.5 h-3.5 text-accent-primary shrink-0" />
          <span>{formatCoordinates(report.latitude, report.longitude)}</span>
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <Clock className="w-3 h-3 text-text-muted shrink-0" />
          <span>Logged: {new Date(report.createdAt).toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <Calendar className="w-3 h-3 text-text-muted shrink-0" />
          <span>Expires: {new Date(report.expiresAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Action */}
      {onNavigateTo && (
        <button
          onClick={() => onNavigateTo(report)}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-accent-primary/10 hover:bg-accent-primary/20 border border-accent-primary/30 text-accent-primary text-xs font-semibold transition-colors"
        >
          <Navigation2 className="w-3.5 h-3.5" />
          Route to Incident
        </button>
      )}
    </div>
  );
}
