import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { Label } from './Label';
import { Switch } from './Switch';
import { Textarea } from './Textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './Select';
import { Badge } from './Badge';
import { 
  Settings, 
  Save, 
  FileText, 
  Upload, 
  MapPin, 
  PenTool, 
  Bell,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { ReportSettings as ReportSettingsType } from '../../types';

/**
 * Report Settings Component
 * 
 * Allows administrators to configure the Report feature settings including:
 * - Enable/disable the report feature
 * - Draft saving preferences
 * - File upload settings
 * - Location and signature requirements
 * - Approval workflow configuration
 * - Notification preferences
 */
const ReportSettings: React.FC = () => {
  // State for form data
  const [settings, setSettings] = useState<ReportSettingsType>({
    id: '1',
    isEnabled: false,
    allowDraftSaving: true,
    autoSaveInterval: 5,
    maxFileSize: 10,
    allowedFileTypes: ['pdf', 'doc', 'docx', 'jpg', 'png', 'xlsx'],
    requireLocation: false,
    requireSignature: false,
    approvalWorkflow: {
      enabled: true,
      approvers: [],
      autoApprove: false
    },
    notificationSettings: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      reminderNotifications: true
    },
    createdBy: 'admin',
    updatedAt: new Date().toISOString()
  });

  // State for UI
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [newFileType, setNewFileType] = useState('');
  const [newApprover, setNewApprover] = useState('');

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  /**
   * Load report settings from storage/API
   */
  const loadSettings = async () => {
    try {
      // TODO: Replace with actual API call
      const savedSettings = localStorage.getItem('reportSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading report settings:', error);
    }
  };

  /**
   * Save report settings to storage/API
   */
  const saveSettings = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      const updatedSettings = {
        ...settings,
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem('reportSettings', JSON.stringify(updatedSettings));
      setSettings(updatedSettings);
      setIsSaved(true);
      
      // Reset saved indicator after 3 seconds
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      console.error('Error saving report settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Add a new allowed file type
   */
  const addFileType = () => {
    if (newFileType.trim() && !settings.allowedFileTypes.includes(newFileType.trim().toLowerCase())) {
      setSettings(prev => ({
        ...prev,
        allowedFileTypes: [...prev.allowedFileTypes, newFileType.trim().toLowerCase()]
      }));
      setNewFileType('');
    }
  };

  /**
   * Remove an allowed file type
   */
  const removeFileType = (fileType: string) => {
    setSettings(prev => ({
      ...prev,
      allowedFileTypes: prev.allowedFileTypes.filter(type => type !== fileType)
    }));
  };

  /**
   * Add a new approver to the workflow
   */
  const addApprover = () => {
    if (newApprover.trim() && !settings.approvalWorkflow.approvers.includes(newApprover.trim())) {
      setSettings(prev => ({
        ...prev,
        approvalWorkflow: {
          ...prev.approvalWorkflow,
          approvers: [...prev.approvalWorkflow.approvers, newApprover.trim()]
        }
      }));
      setNewApprover('');
    }
  };

  /**
   * Remove an approver from the workflow
   */
  const removeApprover = (approver: string) => {
    setSettings(prev => ({
      ...prev,
      approvalWorkflow: {
        ...prev.approvalWorkflow,
        approvers: prev.approvalWorkflow.approvers.filter(a => a !== approver)
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Report Settings</h1>
          <p className="text-muted-foreground">
            Configure the Report feature settings and preferences
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isSaved && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Settings saved!</span>
            </div>
          )}
          <Button onClick={saveSettings} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      {/* Feature Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Feature Configuration
          </CardTitle>
          <CardDescription>
            Enable or disable the Report feature and configure basic settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable Report Feature */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Enable Report Feature</Label>
              <p className="text-sm text-muted-foreground">
                Allow employees to submit reports and admins to create report templates
              </p>
            </div>
            <Switch
              checked={settings.isEnabled}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, isEnabled: checked }))}
            />
          </div>

          {/* Allow Draft Saving */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Allow Draft Saving</Label>
              <p className="text-sm text-muted-foreground">
                Allow employees to save report drafts before final submission
              </p>
            </div>
            <Switch
              checked={settings.allowDraftSaving}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allowDraftSaving: checked }))}
            />
          </div>

          {/* Auto-save Interval */}
          {settings.allowDraftSaving && (
            <div className="space-y-2">
              <Label htmlFor="autoSaveInterval">Auto-save Interval (minutes)</Label>
              <Input
                id="autoSaveInterval"
                type="number"
                min="1"
                max="60"
                value={settings.autoSaveInterval}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  autoSaveInterval: parseInt(e.target.value) || 5 
                }))}
                className="w-32"
              />
              <p className="text-sm text-muted-foreground">
                How often to automatically save report drafts
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* File Upload Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            File Upload Settings
          </CardTitle>
          <CardDescription>
            Configure file upload limits and allowed file types for report attachments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Max File Size */}
          <div className="space-y-2">
            <Label htmlFor="maxFileSize">Maximum File Size (MB)</Label>
            <Input
              id="maxFileSize"
              type="number"
              min="1"
              max="100"
              value={settings.maxFileSize}
              onChange={(e) => setSettings(prev => ({ 
                ...prev, 
                maxFileSize: parseInt(e.target.value) || 10 
              }))}
              className="w-32"
            />
            <p className="text-sm text-muted-foreground">
              Maximum file size allowed for report attachments
            </p>
          </div>

          {/* Allowed File Types */}
          <div className="space-y-4">
            <Label>Allowed File Types</Label>
            <div className="flex flex-wrap gap-2">
              {settings.allowedFileTypes.map((fileType) => (
                <Badge key={fileType} variant="secondary" className="flex items-center gap-1">
                  {fileType.toUpperCase()}
                  <button
                    onClick={() => removeFileType(fileType)}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add file type (e.g., txt, csv)"
                value={newFileType}
                onChange={(e) => setNewFileType(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addFileType()}
                className="flex-1"
              />
              <Button onClick={addFileType} variant="outline" size="sm">
                Add
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              File extensions that employees can upload with their reports
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Submission Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Submission Requirements
          </CardTitle>
          <CardDescription>
            Configure what information is required when employees submit reports
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Require Location */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Require GPS Location
              </Label>
              <p className="text-sm text-muted-foreground">
                Require employees to provide their location when submitting reports
              </p>
            </div>
            <Switch
              checked={settings.requireLocation}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, requireLocation: checked }))}
            />
          </div>

          {/* Require Signature */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base flex items-center gap-2">
                <PenTool className="h-4 w-4" />
                Require Digital Signature
              </Label>
              <p className="text-sm text-muted-foreground">
                Require employees to sign their reports digitally
              </p>
            </div>
            <Switch
              checked={settings.requireSignature}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, requireSignature: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Approval Workflow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Approval Workflow
          </CardTitle>
          <CardDescription>
            Configure the approval process for submitted reports
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable Approval Workflow */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Enable Approval Workflow</Label>
              <p className="text-sm text-muted-foreground">
                Require reports to be approved before they are considered complete
              </p>
            </div>
            <Switch
              checked={settings.approvalWorkflow.enabled}
              onCheckedChange={(checked) => setSettings(prev => ({
                ...prev,
                approvalWorkflow: { ...prev.approvalWorkflow, enabled: checked }
              }))}
            />
          </div>

          {settings.approvalWorkflow.enabled && (
            <>
              {/* Auto-approve */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Auto-approve Reports</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically approve reports without manual review
                  </p>
                </div>
                <Switch
                  checked={settings.approvalWorkflow.autoApprove}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    approvalWorkflow: { ...prev.approvalWorkflow, autoApprove: checked }
                  }))}
                />
              </div>

              {/* Default Approvers */}
              {!settings.approvalWorkflow.autoApprove && (
                <div className="space-y-4">
                  <Label>Default Approvers</Label>
                  <div className="flex flex-wrap gap-2">
                    {settings.approvalWorkflow.approvers.map((approver) => (
                      <Badge key={approver} variant="secondary" className="flex items-center gap-1">
                        {approver}
                        <button
                          onClick={() => removeApprover(approver)}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add approver email or name"
                      value={newApprover}
                      onChange={(e) => setNewApprover(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addApprover()}
                      className="flex-1"
                    />
                    <Button onClick={addApprover} variant="outline" size="sm">
                      Add
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Default approvers for reports that require approval
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
          <CardDescription>
            Configure notification preferences for report-related activities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Notifications */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Send email notifications for report submissions and approvals
              </p>
            </div>
            <Switch
              checked={settings.notificationSettings.emailNotifications}
              onCheckedChange={(checked) => setSettings(prev => ({
                ...prev,
                notificationSettings: { ...prev.notificationSettings, emailNotifications: checked }
              }))}
            />
          </div>

          {/* Push Notifications */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Send push notifications to mobile devices
              </p>
            </div>
            <Switch
              checked={settings.notificationSettings.pushNotifications}
              onCheckedChange={(checked) => setSettings(prev => ({
                ...prev,
                notificationSettings: { ...prev.notificationSettings, pushNotifications: checked }
              }))}
            />
          </div>

          {/* SMS Notifications */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">SMS Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Send SMS notifications for urgent report matters
              </p>
            </div>
            <Switch
              checked={settings.notificationSettings.smsNotifications}
              onCheckedChange={(checked) => setSettings(prev => ({
                ...prev,
                notificationSettings: { ...prev.notificationSettings, smsNotifications: checked }
              }))}
            />
          </div>

          {/* Reminder Notifications */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Reminder Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Send reminder notifications for pending reports
              </p>
            </div>
            <Switch
              checked={settings.notificationSettings.reminderNotifications}
              onCheckedChange={(checked) => setSettings(prev => ({
                ...prev,
                notificationSettings: { ...prev.notificationSettings, reminderNotifications: checked }
              }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Warning for Disabled Feature */}
      {!settings.isEnabled && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-medium">Report Feature is Disabled</p>
                <p className="text-sm">
                  Employees will not be able to submit reports and admins cannot create report templates 
                  until this feature is enabled.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReportSettings; 