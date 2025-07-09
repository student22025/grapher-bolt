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
          <div class="form-group">
            <label for="drive-link-input">Google Drive Folder Link:</label>
            <input type="url" id="drive-link-input" class="form-input" 
                   value="${this.driveSettings.driveLink}" 
                   placeholder="https://drive.google.com/drive/folders/your-folder-id">
            <div class="input-hint">Enter the Google Drive folder link where files should be saved</div>
          </div>
          
          <div class="connection-status">
            <strong>Status:</strong> 
            <span class="status-indicator ${this.driveSettings.isConnected ? 'connected' : 'disconnected'}">
              ${this.driveSettings.isConnected ? '✅ Link Set' : '❌ No Link Set'}
            </span>
          </div>
        </div>
        
        <div class="drive-actions">
          <button id="clear-drive-link" class="sidebtn" ${!this.driveSettings.isConnected ? 'disabled' : ''}>Clear Link</button>
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
    // Clear link button
    document.getElementById('clear-drive-link').onclick = () => this.clearSettings();

    // Save settings button
    document.getElementById('save-drive-settings').onclick = () => {
      const driveLink = document.getElementById('drive-link-input').value.trim();
      
      if (driveLink) {
        this.driveSettings.driveLink = driveLink;
        this.driveSettings.isConnected = true;
        this.saveSettings();
        
        document.getElementById('modal').classList.add('hidden');
        document.getElementById('modal').innerHTML = '';
        this.showSuccessMessage('Drive link saved successfully');
      } else {
        this.driveSettings.driveLink = '';
        this.driveSettings.isConnected = false;
        this.saveSettings();
        
        document.getElementById('modal').classList.add('hidden');
        document.getElementById('modal').innerHTML = '';
        this.showSuccessMessage('Drive link cleared');
      }
    };

    // Cancel button
    document.getElementById('cancel-drive-setup').onclick = () => {
      document.getElementById('modal').classList.add('hidden');
      document.getElementById('modal').innerHTML = '';
    };

    // Real-time validation
    document.getElementById('drive-link-input').addEventListener('input', (e) => {
      const clearBtn = document.getElementById('clear-drive-link');
      const hasLink = e.target.value.trim().length > 0;
      clearBtn.disabled = !hasLink;
    });
  }

  clearSettings() {
    this.driveSettings.driveLink = '';
    this.driveSettings.isConnected = false;
    this.saveSettings();
    this.updateConnectionStatus();
    this.showSuccessMessage('Drive link cleared');
  }

  async uploadFile(data, fileName, folderPath = '') {
    if (!this.driveSettings.isConnected || !this.driveSettings.driveLink) {
      throw new Error('Drive link not set');
    }

    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Log the upload for debugging
    console.log(`File would be uploaded to Google Drive:`, {
      fileName,
      folderPath,
      targetFolder: this.driveSettings.driveLink,
      size: data.length
    });

    // Return the configured drive link as the upload location
    return this.driveSettings.driveLink;
  }

  updateConnectionStatus() {
    const statusElement = document.querySelector('.connection-status .status-indicator');
    if (statusElement) {
      statusElement.className = `status-indicator ${this.driveSettings.isConnected ? 'connected' : 'disconnected'}`;
      statusElement.textContent = this.driveSettings.isConnected ? '✅ Link Set' : '❌ No Link Set';
    }

    // Update button states
    const clearBtn = document.getElementById('clear-drive-link');
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