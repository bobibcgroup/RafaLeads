'use client';

import { useState, useMemo } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  Phone, 
  MessageCircle, 
  Mail, 
  MoreHorizontal,
  Eye,
  Clock,
  User
} from 'lucide-react';
import { Lead, LeadStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TREATMENTS, STATUS_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface LeadsTableProps {
  leads: Lead[];
  onLeadSelect: (lead: Lead) => void;
  onLeadUpdate: (sessionId: string, status: LeadStatus, notes?: string) => void;
}

type SortField = 'timestamp' | 'name' | 'phone' | 'treatment_id' | 'status';
type SortDirection = 'asc' | 'desc';

export function LeadsTable({ leads, onLeadSelect, onLeadUpdate }: LeadsTableProps) {
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const sortedLeads = useMemo(() => {
    return [...leads].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'timestamp') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [leads, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getTreatmentInfo = (treatmentId: string) => {
    return TREATMENTS[treatmentId] || TREATMENTS.other;
  };

  const getStatusColor = (status: LeadStatus) => {
    return STATUS_COLORS[status] || STATUS_COLORS['New'];
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // TODO: Show toast notification
      console.log(`${type} copied to clipboard`);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const openWhatsApp = (phone: string, name: string, treatment: string) => {
    const message = `Hi ${name}, thank you for your interest in ${treatment}. I'm calling from our clinic. When would be a good time to discuss your consultation?`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  if (leads.length === 0) {
    return (
      <div className="glassmorphism-card p-12 rounded-xl text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800/50 flex items-center justify-center">
          <User className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No leads found</h3>
        <p className="text-slate-400">Try adjusting your filters or check back later for new leads.</p>
      </div>
    );
  }

  return (
    <div className="glassmorphism-card rounded-xl overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-slate-700/50">
            <tr>
              {[
                { field: 'timestamp', label: 'Time', icon: Clock },
                { field: 'name', label: 'Name', icon: User },
                { field: 'phone', label: 'Phone', icon: Phone },
                { field: 'treatment_id', label: 'Treatment', icon: null },
                { field: 'status', label: 'Status', icon: null },
                { field: 'actions', label: 'Actions', icon: MoreHorizontal },
              ].map(({ field, label, icon: Icon }) => (
                <th
                  key={field}
                  className={cn(
                    'px-6 py-4 text-left text-sm font-medium text-slate-300',
                    field !== 'actions' && 'cursor-pointer hover:text-white transition-colors'
                  )}
                  onClick={() => field !== 'actions' && handleSort(field as SortField)}
                >
                  <div className="flex items-center space-x-2">
                    {Icon && <Icon className="w-4 h-4" />}
                    <span>{label}</span>
                    {field !== 'actions' && (
                      <div className="flex flex-col">
                        <ChevronUp 
                          className={cn(
                            'w-3 h-3 transition-colors',
                            sortField === field && sortDirection === 'asc' 
                              ? 'text-indigo-400' 
                              : 'text-slate-500'
                          )}
                        />
                        <ChevronDown 
                          className={cn(
                            'w-3 h-3 -mt-1 transition-colors',
                            sortField === field && sortDirection === 'desc' 
                              ? 'text-indigo-400' 
                              : 'text-slate-500'
                          )}
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedLeads.map((lead, index) => {
              const treatment = getTreatmentInfo(lead.treatment_id);
              const statusColor = getStatusColor(lead.status);
              const isHovered = hoveredRow === lead.session_id;
              
              return (
                <tr
                  key={lead.session_id}
                  className={cn(
                    'border-b border-slate-700/30 transition-all duration-200 cursor-pointer group',
                    isHovered && 'bg-slate-800/30 shadow-lg shadow-cyan-500/10'
                  )}
                  onMouseEnter={() => setHoveredRow(lead.session_id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  onClick={() => onLeadSelect(lead)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-300">
                        {formatTimestamp(lead.timestamp)}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                        {lead.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-white">{lead.name}</div>
                        <div className="text-xs text-slate-400">{lead.lang}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-300">{lead.phone}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(lead.phone, 'Phone');
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
                      >
                        <Phone className="w-3 h-3" />
                      </Button>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <Badge 
                      className={`bg-gradient-to-r ${treatment.color} text-white border-0`}
                    >
                      {treatment.name}
                    </Badge>
                  </td>
                  
                  <td className="px-6 py-4">
                    <Badge 
                      className={`bg-gradient-to-r ${statusColor} text-white border-0`}
                    >
                      {lead.status}
                    </Badge>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openWhatsApp(lead.phone, lead.name, treatment.name);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 h-8 w-8 text-green-400 hover:text-green-300 hover:bg-green-500/20"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onLeadSelect(lead);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 h-8 w-8 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/20"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout */}
      <div className="lg:hidden">
        {sortedLeads.map((lead, index) => {
          const treatment = getTreatmentInfo(lead.treatment_id);
          const statusColor = getStatusColor(lead.status);
          
          return (
            <div
              key={lead.session_id}
              className="p-4 border-b border-slate-700/30 last:border-b-0 cursor-pointer hover:bg-slate-800/30 transition-all duration-200"
              onClick={() => onLeadSelect(lead)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                    {lead.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-white">{lead.name}</div>
                    <div className="text-xs text-slate-400">{lead.lang}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge 
                    className={`bg-gradient-to-r ${statusColor} text-white border-0 text-xs`}
                  >
                    {lead.status}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2 mb-3">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-300">{lead.phone}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(lead.phone, 'Phone');
                    }}
                    className="p-1 h-6 w-6"
                  >
                    <Phone className="w-3 h-3" />
                  </Button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-300">
                    {formatTimestamp(lead.timestamp)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Badge 
                  className={`bg-gradient-to-r ${treatment.color} text-white border-0 text-xs`}
                >
                  {treatment.name}
                </Badge>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      openWhatsApp(lead.phone, lead.name, treatment.name);
                    }}
                    className="p-2 h-8 w-8 text-green-400 hover:text-green-300 hover:bg-green-500/20"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onLeadSelect(lead);
                    }}
                    className="p-2 h-8 w-8 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/20"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
