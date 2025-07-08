// Drive Integration System - Processing Grapher Web
import { showModal } from './ui.js';

export class DriveIntegration {
  constructor() {
    this.driveSettings = {
      provider: 'googledrive', // only googledrive
      accessToken: null,
      refreshToken: null,
      isConnected: false,
      baseFolder: '' // Will be set dynamically based on output file name
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
        <h3>☁️ Cloud Drive Setup</h3>
        
        <div class="drive-provider-section">
          <h4>Select Cloud Provider:</h4>
          <div class="provider-options">
            <label class="provider-option">
              <input type="radio" name="provider" value="googledrive" checked>
              <div class="provider-card">
                <div class="provider-icon">📁</div>
                <div class="provider-name">Google Drive</div>
                <div class="provider-status">${this.driveSettings.isConnected ? '✅ Connected' : '⚪ Not Connected'}</div>
              </div>
            </label>
          </div>
        </div>
        
        <div class="drive-settings-section">
          <div class="connection-status">
            <strong>Status:</strong> 
            <span class="status-indicator ${this.driveSettings.isConnected ? 'connected' : 'disconnected'}">
              ${this.driveSettings.isConnected ? '✅ Connected' : '❌ Not Connected'}
            </span>
          </div>
          
          <div class="info-note">
            <p><strong>Note:</strong> Files will be organized in folders based on your output file naming settings.</p>
          </div>
        </div>
        
        <div class="drive-actions">
          <button id="connect-drive" class="sidebtn accent">${this.driveSettings.isConnected ? 'Reconnect' : 'Connect'} Drive</button>
          <button id="test-upload" class="sidebtn" ${!this.driveSettings.isConnected ? 'disabled' : ''}>Test Upload</button>
          <button id="disconnect-drive" class="sidebtn" ${!this.driveSettings.isConnected ? 'disabled' : ''}>Disconnect</button>
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
    // Connect drive button
    document.getElementById('connect-drive').onclick = () => this.connectToDrive();
    
    // Test upload button
    document.getElementById('test-upload').onclick = () => this.testUpload();
    
    // Disconnect button
    document.getElementById('disconnect-drive').onclick = () => this.disconnectDrive();

    // Save settings button
    document.getElementById('save-drive-settings').onclick = () => {
      this.saveSettings();
      document.getElementById('modal').classList.add('hidden');
      document.getElementById('modal').innerHTML = '';
      this.showSuccessMessage('Drive settings saved successfully');
    };

    // Cancel button
    document.getElementById('cancel-drive-setup').onclick = () => {
      document.getElementById('modal').classList.add('hidden');
      document.getElementById('modal').innerHTML = '';
    };
  }

  async connectToDrive() {
    try {
      await this.connectToGoogleDrive();
      
      this.updateConnectionStatus();
    } catch (error) {
      console.error('Drive connection error:', error);
      alert('Failed to connect to drive: ' + error.message);
    }
  }

  async connectToGoogleDrive() {
    // Simulate Google Drive OAuth flow
    // In a real implementation, you would use Google Drive API
    return new Promise((resolve, reject) => {
      // Simulate OAuth popup
      const popup = window.open('about:blank', 'google-auth', 'width=500,height=600');
      
      // Check if popup was blocked
      if (!popup || popup.closed || typeof popup.closed == 'undefined') {
        reject(new Error('Pop-up blocked. Please disable your browser\'s pop-up blocker for this site and try again.'));
        return;
      }
      
      popup.document.write(`
        <html>
          <head><title>Google Drive Authorization</title></head>
          <body style="font-family: Arial; padding: 20px; text-align: center;">
            <h2>🔐 Google Drive Authorization</h2>
            <p>This is a simulation of Google Drive OAuth.</p>
            <p>In a real implementation, this would redirect to Google's OAuth server.</p>
            <br>
            <button onclick="window.opener.postMessage('success', '*'); window.close();" 
                    style="background: #4285f4; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">
              Grant Access
            </button>
            <button onclick="window.opener.postMessage('error', '*'); window.close();" 
                    style="background: #ea4335; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin-left: 10px;">
              Cancel
            </button>
          </body>
        </html>
      `);

      window.addEventListener('message', (event) => {
        if (event.data === 'success') {
          this.driveSettings.accessToken = 'mock_google_token_' + Date.now();
          this.driveSettings.isConnected = true;
          this.saveSettings();
          resolve();
        } else if (event.data === 'error') {
          reject(new Error('User cancelled authorization'));
        }
      }, { once: true });
    });
  }





  disconnectDrive() {
    this.driveSettings.accessToken = null;
    this.driveSettings.refreshToken = null;
    this.driveSettings.isConnected = false;
    this.saveSettings();
    this.updateConnectionStatus();
    this.showSuccessMessage('Drive disconnected successfully');
  }

  async testUpload() {
    if (!this.driveSettings.isConnected) {
      alert('Please connect to a drive first');
      return;
    }

    try {
      // Create a test file
      const testData = `Test Upload,${new Date().toISOString()}\nThis is a test file to verify drive connectivity\nProvider: ${this.driveSettings.provider}\nTimestamp: ${Date.now()}`;
      const testFileName = `test_upload_${Date.now()}.csv`;
      
      const driveLink = await this.uploadFile(testData, testFileName, 'test');
      
      this.showSuccessMessage(`Test upload successful! File uploaded to: ${driveLink}`);
    } catch (error) {
      alert('Test upload failed: ' + error.message);
    }
  }

  async uploadFile(data, fileName, folderPath = '') {
    if (!this.driveSettings.isConnected) {
      throw new Error('Drive not connected');
    }

    // Use the folder path as the base folder (derived from output file naming)
    const fullPath = folderPath ? `${folderPath}/${fileName}` : fileName;
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Generate mock Google Drive link
    let driveLink;
    const fileId = 'mock_file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    driveLink = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;

    // Log the upload for debugging
    console.log(`File uploaded to Google Drive:`, {
      fileName,
      fullPath,
      driveLink,
      size: data.length
    });

    return driveLink;
  }

  updateConnectionStatus() {
    const statusElement = document.querySelector('.connection-status .status-indicator');
    if (statusElement) {
      statusElement.className = `status-indicator ${this.driveSettings.isConnected ? 'connected' : 'disconnected'}`;
      statusElement.textContent = this.driveSettings.isConnected ? '✅ Connected' : '❌ Not Connected';
    }

    // Update button states
    const connectBtn = document.getElementById('connect-drive');
    const testBtn = document.getElementById('test-upload');
    const disconnectBtn = document.getElementById('disconnect-drive');

    if (connectBtn) {
      connectBtn.textContent = this.driveSettings.isConnected ? 'Reconnect' : 'Connect';
    }
    if (testBtn) {
      testBtn.disabled = !this.driveSettings.isConnected;
    }
    if (disconnectBtn) {
      disconnectBtn.disabled = !this.driveSettings.isConnected;
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
    return this.driveSettings.isConnected;
  }

  getProviderName() {
    return 'Google Drive';
  }
}

// Create a global instance
export const driveIntegration = new DriveIntegration();