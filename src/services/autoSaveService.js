const EventEmitter = require('events');

class AutoSaveService extends EventEmitter {
  constructor() {
    super();
    this.documentStates = new Map();
    this.saveQueue = new Map();
    this.conflicts = new Map();
    this.saveHistory = new Map();
    
    this.settings = {
      saveInterval: 10000, // 10 seconds
      maxRetries: 3,
      retryDelay: 2000, // 2 seconds
      maxHistoryEntries: 50,
      conflictResolutionTimeout: 300000, // 5 minutes
      batchSaveDelay: 1000, // 1 second
      compressionThreshold: 10000 // 10KB
    };

    this.metrics = {
      totalSaves: 0,
      successfulSaves: 0,
      failedSaves: 0,
      conflictsResolved: 0,
      averageSaveTime: 0,
      lastSaveTime: null
    };

    this.isProcessing = false;
    this.processingQueue = [];
    
    this.startAutoSave();
    this.startConflictCleanup();
  }

  // Main auto-save registration
  registerDocument(documentId, content, metadata = {}) {
    try {
      const now = new Date();
      const documentState = {
        documentId: documentId,
        currentContent: content,
        lastSavedContent: content,
        lastModified: now,
        lastSaved: now,
        version: 1,
        isDirty: false,
        isLocked: false,
        saveAttempts: 0,
        metadata: {
          userId: metadata.userId,
          documentType: metadata.documentType || 'generic',
          priority: metadata.priority || 'normal',
          autoSaveEnabled: metadata.autoSaveEnabled !== false,
          ...metadata
        },
        saveStrategy: this.determineSaveStrategy(metadata)
      };

      this.documentStates.set(documentId, documentState);
      this.initializeSaveHistory(documentId);

      console.log(`Document ${documentId} registered for auto-save`);
      this.emit('document-registered', { documentId, metadata: documentState.metadata });

      return documentState;

    } catch (error) {
      console.error(`Error registering document ${documentId}:`, error);
      throw error;
    }
  }

  determineSaveStrategy(metadata) {
    // Determine save strategy based on document type and priority
    const strategies = {
      'critical': {
        saveInterval: 5000, // 5 seconds
        maxRetries: 5,
        priority: 'high',
        compression: false
      },
      'medical-record': {
        saveInterval: 8000, // 8 seconds
        maxRetries: 4,
        priority: 'high',
        compression: true
      },
      'progress-note': {
        saveInterval: 10000, // 10 seconds
        maxRetries: 3,
        priority: 'medium',
        compression: true
      },
      'generic': {
        saveInterval: 15000, // 15 seconds
        maxRetries: 3,
        priority: 'normal',
        compression: true
      }
    };

    const docType = metadata.documentType || 'generic';
    const priority = metadata.priority || 'normal';
    
    return strategies[docType] || strategies[priority] || strategies['generic'];
  }

  initializeSaveHistory(documentId) {
    if (!this.saveHistory.has(documentId)) {
      this.saveHistory.set(documentId, []);
    }
  }

  // Update document content
  updateDocument(documentId, content, changeInfo = {}) {
    try {
      const documentState = this.documentStates.get(documentId);
      if (!documentState) {
        throw new Error(`Document ${documentId} not registered`);
      }

      if (documentState.isLocked) {
        console.warn(`Document ${documentId} is locked, queuing update`);
        this.queueUpdate(documentId, content, changeInfo);
        return false;
      }

      const now = new Date();
      const hasChanges = this.hasContentChanged(documentState.currentContent, content);

      if (hasChanges) {
        // Create change delta for efficient storage
        const changeDelta = this.createChangeDelta(documentState.currentContent, content, changeInfo);
        
        documentState.currentContent = content;
        documentState.lastModified = now;
        documentState.isDirty = true;
        documentState.version++;

        // Add to save history
        this.addToSaveHistory(documentId, {
          version: documentState.version,
          timestamp: now,
          changeDelta: changeDelta,
          changeInfo: changeInfo,
          contentLength: content.length
        });

        // Queue for saving
        this.queueForSave(documentId);

        this.emit('document-updated', { 
          documentId, 
          version: documentState.version,
          contentLength: content.length,
          changeInfo 
        });

        console.log(`Document ${documentId} updated to version ${documentState.version}`);
        return true;
      }

      return false; // No changes

    } catch (error) {
      console.error(`Error updating document ${documentId}:`, error);
      this.emit('update-error', { documentId, error: error.message });
      throw error;
    }
  }

  hasContentChanged(oldContent, newContent) {
    if (!oldContent && !newContent) return false;
    if (!oldContent || !newContent) return true;
    
    // Simple content comparison - can be optimized for large documents
    return oldContent !== newContent;
  }

  createChangeDelta(oldContent, newContent, changeInfo) {
    return {
      oldLength: oldContent ? oldContent.length : 0,
      newLength: newContent ? newContent.length : 0,
      changeType: changeInfo.type || 'edit',
      changePosition: changeInfo.position || 0,
      changeLength: changeInfo.length || 0,
      timestamp: new Date()
    };
  }

  addToSaveHistory(documentId, historyEntry) {
    const history = this.saveHistory.get(documentId);
    history.push(historyEntry);

    // Limit history size
    if (history.length > this.settings.maxHistoryEntries) {
      history.splice(0, history.length - this.settings.maxHistoryEntries);
    }
  }

  queueUpdate(documentId, content, changeInfo) {
    const queueEntry = {
      documentId,
      content,
      changeInfo,
      timestamp: new Date()
    };

    this.processingQueue.push(queueEntry);
  }

  queueForSave(documentId) {
    const documentState = this.documentStates.get(documentId);
    if (!documentState || !documentState.isDirty) return;

    const saveStrategy = documentState.saveStrategy;
    const delay = saveStrategy.saveInterval;

    // Cancel existing save timeout
    if (this.saveQueue.has(documentId)) {
      clearTimeout(this.saveQueue.get(documentId).timeoutId);
    }

    // Set new save timeout
    const timeoutId = setTimeout(() => {
      this.performSave(documentId);
    }, delay);

    this.saveQueue.set(documentId, {
      timeoutId: timeoutId,
      queuedAt: new Date(),
      priority: saveStrategy.priority
    });
  }

  async performSave(documentId) {
    const startTime = Date.now();
    const documentState = this.documentStates.get(documentId);
    
    if (!documentState || !documentState.isDirty) {
      return { success: true, reason: 'No changes to save' };
    }

    if (documentState.isLocked) {
      console.warn(`Cannot save locked document ${documentId}`);
      return { success: false, reason: 'Document is locked' };
    }

    try {
      // Lock document during save
      documentState.isLocked = true;
      documentState.saveAttempts++;

      console.log(`Saving document ${documentId} (version ${documentState.version})`);

      // Prepare save data
      const saveData = {
        documentId: documentId,
        content: documentState.currentContent,
        version: documentState.version,
        lastModified: documentState.lastModified,
        metadata: documentState.metadata,
        checksum: this.calculateChecksum(documentState.currentContent)
      };

      // Compress content if needed
      if (documentState.saveStrategy.compression && 
          saveData.content.length > this.settings.compressionThreshold) {
        saveData.compressedContent = this.compressContent(saveData.content);
        saveData.isCompressed = true;
      }

      // Perform the actual save operation
      const saveResult = await this.executeSave(saveData);

      if (saveResult.success) {
        // Update document state after successful save
        documentState.lastSavedContent = documentState.currentContent;
        documentState.lastSaved = new Date();
        documentState.isDirty = false;
        documentState.saveAttempts = 0;

        // Remove from save queue
        this.saveQueue.delete(documentId);

        // Update metrics
        this.metrics.totalSaves++;
        this.metrics.successfulSaves++;
        this.metrics.lastSaveTime = new Date();
        
        const saveTime = Date.now() - startTime;
        this.updateAverageSaveTime(saveTime);

        console.log(`Document ${documentId} saved successfully in ${saveTime}ms`);
        
        this.emit('document-saved', {
          documentId,
          version: documentState.version,
          saveTime: saveTime,
          isCompressed: saveResult.isCompressed
        });

        return { success: true, version: documentState.version, saveTime };

      } else {
        throw new Error(saveResult.error || 'Save operation failed');
      }

    } catch (error) {
      console.error(`Error saving document ${documentId}:`, error);
      
      // Handle save failure
      const retryResult = await this.handleSaveFailure(documentId, error);
      
      this.metrics.totalSaves++;
      this.metrics.failedSaves++;

      this.emit('save-error', {
        documentId,
        error: error.message,
        attempt: documentState.saveAttempts,
        willRetry: retryResult.willRetry
      });

      return { success: false, error: error.message, willRetry: retryResult.willRetry };

    } finally {
      // Unlock document
      documentState.isLocked = false;
      
      // Process any queued updates
      this.processQueuedUpdates(documentId);
    }
  }

  async executeSave(saveData) {
    try {
      // Simulate save operation - replace with actual database/API call
      const saveOperation = new Promise((resolve, reject) => {
        // Simulate network delay
        const delay = Math.random() * 1000 + 500; // 500-1500ms
        
        setTimeout(() => {
          // Simulate occasional failures (5% failure rate)
          if (Math.random() < 0.05) {
            reject(new Error('Simulated save failure'));
          } else {
            resolve({
              success: true,
              savedAt: new Date(),
              version: saveData.version,
              size: saveData.content.length,
              isCompressed: saveData.isCompressed || false
            });
          }
        }, delay);
      });

      return await saveOperation;

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async handleSaveFailure(documentId, error) {
    const documentState = this.documentStates.get(documentId);
    const saveStrategy = documentState.saveStrategy;

    if (documentState.saveAttempts < saveStrategy.maxRetries) {
      // Schedule retry
      console.log(`Retrying save for document ${documentId} (attempt ${documentState.saveAttempts}/${saveStrategy.maxRetries})`);
      
      setTimeout(() => {
        this.performSave(documentId);
      }, this.settings.retryDelay * documentState.saveAttempts);

      return { willRetry: true, nextAttempt: documentState.saveAttempts + 1 };
    } else {
      // Max retries reached
      console.error(`Max save attempts reached for document ${documentId}`);
      
      // Store failed save for manual recovery
      this.storeFaultySave(documentId, error);
      
      return { willRetry: false, maxAttemptsReached: true };
    }
  }

  storeFaultySave(documentId, error) {
    const documentState = this.documentStates.get(documentId);
    const faultyData = {
      documentId: documentId,
      content: documentState.currentContent,
      version: documentState.version,
      failedAt: new Date(),
      error: error.message,
      attempts: documentState.saveAttempts
    };

    // Store in a recovery collection/file system for manual recovery
    console.log(`Storing faulty save data for document ${documentId} for manual recovery`);
    this.emit('save-failure-stored', faultyData);
  }

  processQueuedUpdates(documentId) {
    const queuedUpdates = this.processingQueue.filter(entry => entry.documentId === documentId);
    
    if (queuedUpdates.length > 0) {
      console.log(`Processing ${queuedUpdates.length} queued updates for document ${documentId}`);
      
      // Process most recent update
      const latestUpdate = queuedUpdates[queuedUpdates.length - 1];
      this.updateDocument(documentId, latestUpdate.content, latestUpdate.changeInfo);
      
      // Remove processed updates
      this.processingQueue = this.processingQueue.filter(entry => entry.documentId !== documentId);
    }
  }

  // Conflict resolution
  detectConflict(documentId, incomingVersion, incomingContent) {
    const documentState = this.documentStates.get(documentId);
    if (!documentState) return null;

    const hasVersionConflict = incomingVersion !== documentState.version;
    const hasContentConflict = incomingContent !== documentState.currentContent;

    if (hasVersionConflict || hasContentConflict) {
      const conflict = {
        documentId: documentId,
        type: hasVersionConflict ? 'version' : 'content',
        localVersion: documentState.version,
        incomingVersion: incomingVersion,
        localContent: documentState.currentContent,
        incomingContent: incomingContent,
        detectedAt: new Date(),
        status: 'pending'
      };

      this.conflicts.set(documentId, conflict);
      this.emit('conflict-detected', conflict);

      return conflict;
    }

    return null;
  }

  async resolveConflict(documentId, resolution) {
    const conflict = this.conflicts.get(documentId);
    if (!conflict) {
      throw new Error(`No conflict found for document ${documentId}`);
    }

    try {
      let resolvedContent;
      
      switch (resolution.strategy) {
        case 'use-local':
          resolvedContent = conflict.localContent;
          break;
        case 'use-remote':
          resolvedContent = conflict.incomingContent;
          break;
        case 'merge':
          resolvedContent = await this.mergeContent(conflict.localContent, conflict.incomingContent, resolution.mergeInstructions);
          break;
        case 'manual':
          resolvedContent = resolution.resolvedContent;
          break;
        default:
          throw new Error(`Unknown resolution strategy: ${resolution.strategy}`);
      }

      // Update document with resolved content
      const documentState = this.documentStates.get(documentId);
      documentState.currentContent = resolvedContent;
      documentState.version++;
      documentState.lastModified = new Date();
      documentState.isDirty = true;

      // Mark conflict as resolved
      conflict.status = 'resolved';
      conflict.resolvedAt = new Date();
      conflict.resolution = resolution;

      // Force save resolved content
      await this.performSave(documentId);

      this.metrics.conflictsResolved++;
      this.emit('conflict-resolved', { documentId, resolution: resolution.strategy });

      console.log(`Conflict resolved for document ${documentId} using strategy: ${resolution.strategy}`);

      return { success: true, resolvedContent, newVersion: documentState.version };

    } catch (error) {
      console.error(`Error resolving conflict for document ${documentId}:`, error);
      conflict.status = 'error';
      conflict.error = error.message;
      throw error;
    }
  }

  async mergeContent(localContent, incomingContent, instructions = {}) {
    // Simple merge strategy - can be enhanced with proper diff/merge algorithms
    const strategy = instructions.strategy || 'append';
    
    switch (strategy) {
      case 'append':
        return localContent + '\n\n--- MERGED CONTENT ---\n\n' + incomingContent;
      case 'prepend':
        return incomingContent + '\n\n--- MERGED CONTENT ---\n\n' + localContent;
      case 'interleave':
        // More sophisticated merging would go here
        return this.interleaveContent(localContent, incomingContent);
      default:
        return localContent; // Default to local content
    }
  }

  interleaveContent(content1, content2) {
    const lines1 = content1.split('\n');
    const lines2 = content2.split('\n');
    const merged = [];
    
    const maxLines = Math.max(lines1.length, lines2.length);
    
    for (let i = 0; i < maxLines; i++) {
      if (i < lines1.length) merged.push(lines1[i]);
      if (i < lines2.length) merged.push(`[MERGED] ${lines2[i]}`);
    }
    
    return merged.join('\n');
  }

  // Auto-save lifecycle management
  startAutoSave() {
    this.autoSaveInterval = setInterval(() => {
      this.processAutoSaves();
    }, this.settings.saveInterval / 2); // Check twice as often as save interval

    console.log('Auto-save service started');
  }

  stopAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }

    // Clear all pending saves
    for (const [documentId, queueEntry] of this.saveQueue.entries()) {
      clearTimeout(queueEntry.timeoutId);
    }
    this.saveQueue.clear();

    console.log('Auto-save service stopped');
  }

  processAutoSaves() {
    // Process documents that need saving
    for (const [documentId, documentState] of this.documentStates.entries()) {
      if (documentState.isDirty && !documentState.isLocked && !this.saveQueue.has(documentId)) {
        const timeSinceLastModified = Date.now() - documentState.lastModified.getTime();
        const saveInterval = documentState.saveStrategy.saveInterval;

        if (timeSinceLastModified >= saveInterval) {
          console.log(`Auto-saving document ${documentId} after ${timeSinceLastModified}ms`);
          this.queueForSave(documentId);
        }
      }
    }
  }

  startConflictCleanup() {
    // Clean up old resolved conflicts
    setInterval(() => {
      const cutoffTime = Date.now() - this.settings.conflictResolutionTimeout;
      
      for (const [documentId, conflict] of this.conflicts.entries()) {
        if (conflict.status === 'resolved' && conflict.resolvedAt && 
            conflict.resolvedAt.getTime() < cutoffTime) {
          this.conflicts.delete(documentId);
        }
      }
    }, 60000); // Clean up every minute
  }

  // Public API methods
  async saveNow(documentId) {
    const documentState = this.documentStates.get(documentId);
    if (!documentState) {
      throw new Error(`Document ${documentId} not found`);
    }

    // Cancel queued save and save immediately
    if (this.saveQueue.has(documentId)) {
      clearTimeout(this.saveQueue.get(documentId).timeoutId);
      this.saveQueue.delete(documentId);
    }

    return await this.performSave(documentId);
  }

  async saveAll() {
    const savePromises = [];
    
    for (const [documentId, documentState] of this.documentStates.entries()) {
      if (documentState.isDirty && !documentState.isLocked) {
        savePromises.push(this.saveNow(documentId));
      }
    }

    const results = await Promise.allSettled(savePromises);
    
    return {
      totalAttempted: savePromises.length,
      successful: results.filter(r => r.status === 'fulfilled' && r.value.success).length,
      failed: results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)).length,
      results: results
    };
  }

  unregisterDocument(documentId) {
    const documentState = this.documentStates.get(documentId);
    if (!documentState) return false;

    // Save any pending changes before unregistering
    if (documentState.isDirty) {
      this.saveNow(documentId).catch(error => {
        console.error(`Failed to save document ${documentId} before unregistering:`, error);
      });
    }

    // Clean up
    if (this.saveQueue.has(documentId)) {
      clearTimeout(this.saveQueue.get(documentId).timeoutId);
      this.saveQueue.delete(documentId);
    }

    this.documentStates.delete(documentId);
    this.saveHistory.delete(documentId);
    this.conflicts.delete(documentId);

    console.log(`Document ${documentId} unregistered from auto-save`);
    this.emit('document-unregistered', { documentId });

    return true;
  }

  getDocumentState(documentId) {
    const state = this.documentStates.get(documentId);
    if (!state) return null;

    return {
      documentId: documentId,
      version: state.version,
      lastModified: state.lastModified,
      lastSaved: state.lastSaved,
      isDirty: state.isDirty,
      isLocked: state.isLocked,
      saveAttempts: state.saveAttempts,
      contentLength: state.currentContent.length,
      metadata: state.metadata
    };
  }

  getAllDocumentStates() {
    const states = [];
    for (const [documentId] of this.documentStates.entries()) {
      states.push(this.getDocumentState(documentId));
    }
    return states;
  }

  getSaveHistory(documentId, limit = 10) {
    const history = this.saveHistory.get(documentId) || [];
    return history.slice(-limit);
  }

  getMetrics() {
    return {
      ...this.metrics,
      documentsRegistered: this.documentStates.size,
      documentsInQueue: this.saveQueue.size,
      activeConflicts: Array.from(this.conflicts.values()).filter(c => c.status === 'pending').length,
      resolvedConflicts: Array.from(this.conflicts.values()).filter(c => c.status === 'resolved').length
    };
  }

  // Utility methods
  calculateChecksum(content) {
    // Simple checksum - use proper hashing in production
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  compressContent(content) {
    // Simple compression simulation - use proper compression library in production
    return `COMPRESSED[${content.length}]:${content.substring(0, 100)}...`;
  }

  updateAverageSaveTime(saveTime) {
    if (this.metrics.averageSaveTime === 0) {
      this.metrics.averageSaveTime = saveTime;
    } else {
      this.metrics.averageSaveTime = (this.metrics.averageSaveTime + saveTime) / 2;
    }
  }

  // Configuration methods
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    console.log('Auto-save settings updated:', newSettings);
    this.emit('settings-updated', this.settings);
  }

  getSettings() {
    return { ...this.settings };
  }

  // Health check
  getHealthStatus() {
    const now = Date.now();
    const documentsWithIssues = Array.from(this.documentStates.values()).filter(doc => 
      doc.saveAttempts > 0 || doc.isLocked || (doc.isDirty && (now - doc.lastModified.getTime()) > doc.saveStrategy.saveInterval * 2)
    );

    return {
      status: documentsWithIssues.length === 0 ? 'healthy' : 'degraded',
      documentsRegistered: this.documentStates.size,
      documentsWithIssues: documentsWithIssues.length,
      pendingSaves: this.saveQueue.size,
      activeConflicts: Array.from(this.conflicts.values()).filter(c => c.status === 'pending').length,
      metrics: this.getMetrics(),
      lastActivity: this.metrics.lastSaveTime,
      timestamp: new Date()
    };
  }
}

module.exports = new AutoSaveService();