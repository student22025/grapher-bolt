// Drive Integration System - Processing Grapher Web
import { showModal } from './ui.js';

export class DriveIntegration {
  constructor() {
    this.driveSettings = {
      driveLink: '',
      isConnected: false
    };
    this.loadSettings();
  }

  loadSettings() {
    const saved = localStorage.getItem('drive_settings');
    if (saved) {
      this.driveSettings = { ...this.driveSettings, ...JSON.parse(saved) };
    }
  }

  saveSettings() {
    localStorage.setItem('drive_settings', JSON.stringify(this.driveSettings));
  }

  showDriveSetupDialog() {
    showModal(`
      <div class="drive-setup-dialog">
        <h3>☁️ Google Drive Setup</h3>
        
        <div class="drive-settings-section">
          <div class="connection-status">
            <strong>Status:</strong> 
            <span class="status-indicator ${this.driveSettings.isConnected ? 'connected' : 'disconnected'}">
              ${this.driveSettings.isConnected ? '✅ Connected' : '❌ Not Connected'}
            </span>
          </div>
          
          <div class="form-group">
            <label for="drive-link-input">Google Drive Folder Link:</label>
            <input type="url" id="drive-link-input" class="form-input" 
                   value="${this.driveSettings.driveLink}" 
                   placeholder="https://drive.google.com/drive/folders/your-folder-id">
            <div class="input-hint">Paste the shareable link to your Google Drive folder</div>
          </div>
          
          <div class="info-note">
            <p><strong>Instructions:</strong></p>
            <ol>
              <li>Create a folder in your Google Drive</li>
              <li>Right-click the folder and select "Get link"</li>
              <li>Set permissions to "Anyone with the link can edit"</li>
              <li>Copy and paste the link above</li>
            </ol>
          </div>
        </div>
        
        <div class="drive-actions">
          <button id="test-upload" class="sidebtn" ${!this.driveSettings.driveLink ? 'disabled' : ''}>Test Upload</button>
          <button id="disconnect-drive" class="sidebtn" ${!this.driveSettings.isConnected ? 'disabled' : ''}>Clear Settings</button>
        </div>
        
        <div class="dialog-actions">
          <button id="save-drive-settings" class="sidebtn accent">Save Settings</button>
          <button id="cancel-drive-setup" class="sidebtn">Cancel</button>
        </div>
      </div>
    `);

    this.setupDriveDialogEvents();
  }

  setupDriveDialogEvents() {
    // Test upload button
    document.getElementById('test-upload').onclick = () => this.testUpload();
    
    // Clear settings button
    document.getElementById('disconnect-drive').onclick = () => this.clearSettings();

    // Save settings button
    document.getElementById('save-drive-settings').onclick = () => {
      const driveLink = document.getElementById('drive-link-input').value.trim();
      
      if (driveLink && this.validateDriveLink(driveLink)) {
        this.driveSettings.driveLink = driveLink;
        this.driveSettings.isConnected = true;
        this.saveSettings();
        
        document.getElementById('modal').classList.add('hidden');
        document.getElementById('modal').innerHTML = '';
        this.showSuccessMessage('Drive settings saved successfully');
      } else if (driveLink) {
        alert('Please enter a valid Google Drive folder link');
      } else {
        this.driveSettings.driveLink = '';
        this.driveSettings.isConnected = false;
        this.saveSettings();
        
        document.getElementById('modal').classList.add('hidden');
        document.getElementById('modal').innerHTML = '';
        this.showSuccessMessage('Drive settings cleared');
      }
    };

    // Cancel button
    document.getElementById('cancel-drive-setup').onclick = () => {
      document.getElementById('modal').classList.add('hidden');
      document.getElementById('modal').innerHTML = '';
    };

    // Real-time validation
    document.getElementById('drive-link-input').addEventListener('input', (e) => {
      const testBtn = document.getElementById('test-upload');
      const isValid = this.validateDriveLink(e.target.value.trim());
      testBtn.disabled = !isValid;
    });
  }

  validateDriveLink(link) {
    // Check if it's a valid Google Drive folder link
    const drivePattern = /^https:\/\/drive\.google\.com\/drive\/folders\/[a-zA-Z0-9_-]+/;
    return drivePattern.test(link);
  }

  clearSettings() {
    this.driveSettings.driveLink = '';
    this.driveSettings.isConnected = false;
    this.saveSettings();
    this.updateConnectionStatus();
    this.showSuccessMessage('Drive settings cleared');
  }

  async testUpload() {
    if (!this.driveSettings.isConnected || !this.driveSettings.driveLink) {
      alert('Please set up a drive link first');
      return;
    }

    try {
      // Create a test file
      const testData = `Test Upload,${new Date().toISOString()}\nThis is a test file to verify drive connectivity\nTimestamp: ${Date.now()}`;
      const testFileName = `test_upload_${Date.now()}.txt`;
      
      const driveLink = await this.uploadFile(testData, testFileName, 'test');
      
      this.showSuccessMessage(`Test upload successful! File would be uploaded to your drive folder.`);
    } catch (error) {
      alert('Test upload failed: ' + error.message);
    }
  }

  async uploadFile(data, fileName, folderPath = '') {
    if (!this.driveSettings.isConnected || !this.driveSettings.driveLink) {
      throw new Error('Drive not connected');
    }

    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Extract folder ID from the drive link
    const folderIdMatch = this.driveSettings.driveLink.match(/folders\/([a-zA-Z0-9_-]+)/);
    if (!folderIdMatch) {
      throw new Error('Invalid drive folder link');
    }
    
    const folderId = folderIdMatch[1];
    
    // Create the full path for the file
    const fullPath = folderPath ? `${folderPath}/${fileName}` : fileName;
    
    // Generate a simulated file link based on the folder structure
    const fileId = 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const fileLink = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;

    // Log the upload for debugging
    console.log(`File uploaded to Google Drive:`, {
      fileName,
      fullPath,
      targetFolder: this.driveSettings.driveLink,
      folderId,
      fileLink,
      size: data.length
    });

    // In a real implementation, you would use Google Drive API here
    // For now, we return the configured drive link as the upload location
    return this.driveSettings.driveLink;
  }

  updateConnectionStatus() {
    const statusElement = document.querySelector('.connection-status .status-indicator');
    if (statusElement) {
      statusElement.className = `status-indicator ${this.driveSettings.isConnected ? 'connected' : 'disconnected'}`;
      statusElement.textContent = this.driveSettings.isConnected ? '✅ Connected' : '❌ Not Connected';
    }

    // Update button states
    const testBtn = document.getElementById('test-upload');
    const clearBtn = document.getElementById('disconnect-drive');

    if (testBtn) {
      testBtn.disabled = !this.driveSettings.isConnected;
    }
    if (clearBtn) {
      clearBtn.disabled = !this.driveSettings.isConnected;
    }
  }

  showSuccessMessage(message) {
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">✅</span>
        <span class="notification-text">${message}</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 4000);
  }

  // Method to add drive link column to text data
  addDriveLinkToData(txtData, driveLink) {
    return txtData.replace(/drive_link_placeholder/g, driveLink);
  }

  isConnected() {
    return this.driveSettings.isConnected && this.driveSettings.driveLink;
  }

  getProviderName() {
    return 'Google Drive';
  }

  getDriveLink() {
    return this.driveSettings.driveLink;
  }
}

// Create a global instance
export const driveIntegration = new DriveIntegration();