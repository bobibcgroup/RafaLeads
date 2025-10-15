'use client';

import { useState } from 'react';
import { 
  X, 
  Phone, 
  MessageCircle, 
  Mail, 
  Copy, 
  Check,
  Clock,
  User,
  MapPin,
  Globe,
  Calendar,
  FileText,
  Save
} from 'lucide-react';
import { Lead, Clinic, LeadStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TREATMENTS, STATUS_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface LeadDetailModalProps {
  lead: Lead;
  clinic: Clinic;
  onClose: () => void;
  onUpdate: (sessionId: string, status: LeadStatus, notes?: string) => void;
}

export function LeadDetailModal({ lead, clinic, onClose, onUpdate }: LeadDetailModalProps) {
  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const [notes, setNotes] = useState(lead.notes || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const treatment = TREATMENTS[lead.treatment_id] || TREATMENTS.other;
  const statusColor = STATUS_COLORS[status] || STATUS_COLORS['New'];

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      await onUpdate(lead.session_id, status, notes);
      onClose();
    } catch (error) {
      console.error('Error updating lead:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const openWhatsApp = () => {
    const message = `Hi ${lead.name}, thank you for your interest in ${treatment.name}. I'm calling from ${clinic.name}. When would be a good time to discuss your consultation?`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${lead.phone.replace(/\D/g, '')}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const openEmail = () => {
    const subject = `Consultation Inquiry - ${treatment.name}`;
    const body = `Hi ${lead.name},\n\nThank you for your interest in ${treatment.name}. I'm calling from ${clinic.name}.\n\nWhen would be a good time to discuss your consultation?\n\nBest regards,\n${clinic.name}`;
    const mailtoUrl = `mailto:${lead.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="glassmorphism-modal max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold gradient-text">
              Lead Details
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="glassmorphism-button hover-glow"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Header with lead info */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                {lead.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{lead.name}</h2>
                <div className="flex items-center space-x-4 text-sm text-slate-400">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatTimestamp(lead.timestamp)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Globe className="w-4 h-4" />
                    <span>{lead.lang}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <Badge className={`bg-gradient-to-r ${statusColor} text-white border-0 text-lg px-4 py-2`}>
              {status}
            </Badge>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                <Phone className="w-5 h-5" />
                <span>Contact Information</span>
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 glassmorphism-card rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="text-white">{lead.phone}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(lead.phone, 'phone')}
                    className="glassmorphism-button hover-glow"
                  >
                    {copiedField === 'phone' ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                {lead.email && (
                  <div className="flex items-center justify-between p-3 glassmorphism-card rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="text-white">{lead.email}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(lead.email!, 'email')}
                      className="glassmorphism-button hover-glow"
                    >
                      {copiedField === 'email' ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Treatment Interest</span>
              </h3>
              
              <div className="p-4 glassmorphism-card rounded-lg">
                <Badge className={`bg-gradient-to-r ${treatment.color} text-white border-0 text-base px-4 py-2 mb-3`}>
                  {treatment.name}
                </Badge>
                <p className="text-slate-300 text-sm">
                  Interested in {treatment.name} treatment
                </p>
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <span>Message</span>
            </h3>
            <div className="p-4 glassmorphism-card rounded-lg">
              <p className="text-slate-300 whitespace-pre-wrap">{lead.message}</p>
            </div>
          </div>

          {/* Status and Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Update Status</h3>
              <Select value={status} onValueChange={(value) => setStatus(value as LeadStatus)}>
                <SelectTrigger className="glassmorphism-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glassmorphism-card border-slate-700/50">
                  {(['New', 'Contacted', 'Booked', 'Converted', 'Not Interested'] as LeadStatus[]).map((statusOption) => (
                    <SelectItem key={statusOption} value={statusOption}>
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${STATUS_COLORS[statusOption]}`} />
                        <span>{statusOption}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Notes</h3>
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-slate-300">Add notes about this lead</Label>
                <Input
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add your notes here..."
                  className="glassmorphism-input"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-700/50">
            <div className="flex items-center space-x-3">
              <Button
                onClick={openWhatsApp}
                className="bg-green-500 hover:bg-green-600 text-white hover-glow"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
              
              {lead.email && (
                <Button
                  onClick={openEmail}
                  className="bg-blue-500 hover:bg-blue-600 text-white hover-glow"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
              )}
              
              <Button
                onClick={() => window.open(`tel:${lead.phone}`, '_self')}
                className="bg-indigo-500 hover:bg-indigo-600 text-white hover-glow"
              >
                <Phone className="w-4 h-4 mr-2" />
                Call
              </Button>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="glassmorphism-button hover-glow"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isUpdating}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white hover-glow"
              >
                {isUpdating ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
