const WebSocket = require('ws');
const EventEmitter = require('events');

class EventStreamingService extends EventEmitter {
  constructor() {
    super();
    this.connections = new Map();
    this.channels = new Map();
    this.eventHistory = new Map();
    this.metrics = {
      totalConnections: 0,
      activeConnections: 0,
      messagesProcessed: 0,
      errorsCount: 0,
      startTime: new Date()
    };
    
    this.wsServer = null;
    this.eventQueue = [];
    this.isProcessingQueue = false;
    this.maxHistorySize = 1000;
    this.heartbeatInterval = 30000; // 30 seconds
    
    this.initializeChannels();
    this.startHeartbeat();
  }

  initializeChannels() {
    // Define available channels for different types of real-time updates
    const channels = [
      'compliance-alerts',
      'document-updates',
      'user-activity',
      'system-notifications',
      'dashboard-metrics',
      'audit-events',
      'workflow-updates',
      'patient-alerts',
      'staff-notifications',
      'medication-reminders',
      'appointment-updates',
      'emergency-alerts'
    ];

    channels.forEach(channel => {
      this.channels.set(channel, {
        name: channel,
        subscribers: new Set(),
        messageCount: 0,
        lastActivity: new Date(),
        metadata: {
          description: this.getChannelDescription(channel),
          priority: this.getChannelPriority(channel),
          retention: this.getChannelRetention(channel)
        }
      });
    });
  }

  getChannelDescription(channel) {
    const descriptions = {
      'compliance-alerts': 'Real-time compliance violations and regulatory alerts',
      'document-updates': 'Document creation, modification, and approval notifications',
      'user-activity': 'User login, logout, and activity tracking',
      'system-notifications': 'System maintenance, updates, and operational messages',
      'dashboard-metrics': 'Live dashboard data and KPI updates',
      'audit-events': 'Security and compliance audit trail events',
      'workflow-updates': 'Care plan and workflow status changes',
      'patient-alerts': 'Patient condition changes and critical alerts',
      'staff-notifications': 'Staff scheduling, assignments, and communications',
      'medication-reminders': 'Medication administration reminders and alerts',
      'appointment-updates': 'Appointment scheduling and status changes',
      'emergency-alerts': 'Critical emergency notifications and responses'
    };
    return descriptions[channel] || 'General purpose event channel';
  }

  getChannelPriority(channel) {
    const priorities = {
      'emergency-alerts': 'critical',
      'patient-alerts': 'high',
      'compliance-alerts': 'high',
      'medication-reminders': 'high',
      'workflow-updates': 'medium',
      'document-updates': 'medium',
      'staff-notifications': 'medium',
      'dashboard-metrics': 'low',
      'user-activity': 'low',
      'system-notifications': 'low',
      'audit-events': 'low',
      'appointment-updates': 'low'
    };
    return priorities[channel] || 'low';
  }

  getChannelRetention(channel) {
    const retentions = {
      'emergency-alerts': 7 * 24 * 60 * 60 * 1000, // 7 days
      'patient-alerts': 3 * 24 * 60 * 60 * 1000, // 3 days
      'compliance-alerts': 5 * 24 * 60 * 60 * 1000, // 5 days
      'medication-reminders': 24 * 60 * 60 * 1000, // 1 day
      'workflow-updates': 2 * 24 * 60 * 60 * 1000, // 2 days
      'document-updates': 24 * 60 * 60 * 1000, // 1 day
      'staff-notifications': 2 * 24 * 60 * 60 * 1000, // 2 days
      'dashboard-metrics': 4 * 60 * 60 * 1000, // 4 hours
      'user-activity': 12 * 60 * 60 * 1000, // 12 hours
      'system-notifications': 24 * 60 * 60 * 1000, // 1 day
      'audit-events': 7 * 24 * 60 * 60 * 1000, // 7 days
      'appointment-updates': 24 * 60 * 60 * 1000 // 1 day
    };
    return retentions[channel] || 60 * 60 * 1000; // 1 hour default
  }

  startServer(port = 3001) {
    try {
      this.wsServer = new WebSocket.Server({ 
        port: port,
        perMessageDeflate: false,
        maxPayload: 16 * 1024, // 16KB max message size
      });

      this.wsServer.on('connection', (ws, request) => {
        this.handleConnection(ws, request);
      });

      this.wsServer.on('error', (error) => {
        console.error('WebSocket server error:', error);
        this.metrics.errorsCount++;
        this.emit('server-error', error);
      });

      console.log(`Event streaming server started on port ${port}`);
      this.emit('server-started', { port });

    } catch (error) {
      console.error('Failed to start WebSocket server:', error);
      throw error;
    }
  }

  handleConnection(ws, request) {
    const connectionId = this.generateConnectionId();
    const userAgent = request.headers['user-agent'] || 'unknown';
    const clientIP = request.socket.remoteAddress;

    const connection = {
      id: connectionId,
      ws: ws,
      channels: new Set(),
      metadata: {
        connectedAt: new Date(),
        userAgent: userAgent,
        clientIP: clientIP,
        lastActivity: new Date(),
        messagesSent: 0,
        messagesReceived: 0
      },
      isAlive: true
    };

    this.connections.set(connectionId, connection);
    this.metrics.totalConnections++;
    this.metrics.activeConnections++;

    console.log(`New WebSocket connection: ${connectionId} from ${clientIP}`);

    // Send welcome message
    this.sendToConnection(connectionId, {
      type: 'connection-established',
      connectionId: connectionId,
      timestamp: new Date(),
      availableChannels: Array.from(this.channels.keys()),
      serverInfo: {
        version: '1.0.0',
        features: ['real-time-events', 'channel-subscription', 'message-history']
      }
    });

    // Handle incoming messages
    ws.on('message', (data) => {
      this.handleMessage(connectionId, data);
    });

    // Handle connection close
    ws.on('close', (code, reason) => {
      this.handleDisconnection(connectionId, code, reason);
    });

    // Handle connection errors
    ws.on('error', (error) => {
      console.error(`WebSocket error for connection ${connectionId}:`, error);
      this.metrics.errorsCount++;
      this.handleConnectionError(connectionId, error);
    });

    // Handle pong responses for heartbeat
    ws.on('pong', () => {
      if (this.connections.has(connectionId)) {
        this.connections.get(connectionId).isAlive = true;
        this.connections.get(connectionId).metadata.lastActivity = new Date();
      }
    });

    this.emit('connection-established', { connectionId, metadata: connection.metadata });
  }

  handleMessage(connectionId, data) {
    try {
      const connection = this.connections.get(connectionId);
      if (!connection) return;

      connection.metadata.messagesReceived++;
      connection.metadata.lastActivity = new Date();

      const message = JSON.parse(data.toString());
      
      switch (message.type) {
        case 'subscribe':
          this.handleSubscription(connectionId, message);
          break;
        case 'unsubscribe':
          this.handleUnsubscription(connectionId, message);
          break;
        case 'get-history':
          this.handleHistoryRequest(connectionId, message);
          break;
        case 'ping':
          this.handlePing(connectionId, message);
          break;
        case 'publish':
          this.handlePublish(connectionId, message);
          break;
        default:
          this.sendError(connectionId, 'unknown-message-type', `Unknown message type: ${message.type}`);
      }

      this.metrics.messagesProcessed++;

    } catch (error) {
      console.error(`Error handling message from ${connectionId}:`, error);
      this.sendError(connectionId, 'message-parse-error', 'Invalid JSON message');
      this.metrics.errorsCount++;
    }
  }

  handleSubscription(connectionId, message) {
    const { channel, filters } = message;
    
    if (!this.channels.has(channel)) {
      this.sendError(connectionId, 'invalid-channel', `Channel '${channel}' does not exist`);
      return;
    }

    const connection = this.connections.get(connectionId);
    if (!connection) return;

    // Add connection to channel
    this.channels.get(channel).subscribers.add(connectionId);
    connection.channels.add(channel);

    // Store filters if provided
    if (filters) {
      connection.filters = connection.filters || {};
      connection.filters[channel] = filters;
    }

    this.sendToConnection(connectionId, {
      type: 'subscription-confirmed',
      channel: channel,
      timestamp: new Date(),
      subscriberCount: this.channels.get(channel).subscribers.size
    });

    console.log(`Connection ${connectionId} subscribed to channel: ${channel}`);
    this.emit('subscription', { connectionId, channel, filters });
  }

  handleUnsubscription(connectionId, message) {
    const { channel } = message;
    
    if (!this.channels.has(channel)) {
      this.sendError(connectionId, 'invalid-channel', `Channel '${channel}' does not exist`);
      return;
    }

    const connection = this.connections.get(connectionId);
    if (!connection) return;

    // Remove connection from channel
    this.channels.get(channel).subscribers.delete(connectionId);
    connection.channels.delete(channel);

    // Remove filters for this channel
    if (connection.filters && connection.filters[channel]) {
      delete connection.filters[channel];
    }

    this.sendToConnection(connectionId, {
      type: 'unsubscription-confirmed',
      channel: channel,
      timestamp: new Date()
    });

    console.log(`Connection ${connectionId} unsubscribed from channel: ${channel}`);
    this.emit('unsubscription', { connectionId, channel });
  }

  handleHistoryRequest(connectionId, message) {
    const { channel, limit = 10, since } = message;
    
    if (!this.channels.has(channel)) {
      this.sendError(connectionId, 'invalid-channel', `Channel '${channel}' does not exist`);
      return;
    }

    const history = this.eventHistory.get(channel) || [];
    let filteredHistory = history;

    if (since) {
      const sinceDate = new Date(since);
      filteredHistory = history.filter(event => new Date(event.timestamp) > sinceDate);
    }

    const limitedHistory = filteredHistory.slice(-limit);

    this.sendToConnection(connectionId, {
      type: 'history-response',
      channel: channel,
      events: limitedHistory,
      count: limitedHistory.length,
      timestamp: new Date()
    });
  }

  handlePing(connectionId, message) {
    this.sendToConnection(connectionId, {
      type: 'pong',
      timestamp: new Date(),
      originalTimestamp: message.timestamp
    });
  }

  handlePublish(connectionId, message) {
    // Allow authenticated connections to publish events
    const { channel, event, priority = 'medium' } = message;
    
    if (!this.channels.has(channel)) {
      this.sendError(connectionId, 'invalid-channel', `Channel '${channel}' does not exist`);
      return;
    }

    // Add publisher info to event
    const enrichedEvent = {
      ...event,
      publisherId: connectionId,
      publishedAt: new Date(),
      priority: priority
    };

    this.publishEvent(channel, enrichedEvent);
  }

  handleDisconnection(connectionId, code, reason) {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    // Remove from all channels
    connection.channels.forEach(channel => {
      if (this.channels.has(channel)) {
        this.channels.get(channel).subscribers.delete(connectionId);
      }
    });

    this.connections.delete(connectionId);
    this.metrics.activeConnections--;

    console.log(`WebSocket connection closed: ${connectionId} (code: ${code}, reason: ${reason})`);
    this.emit('connection-closed', { connectionId, code, reason, metadata: connection.metadata });
  }

  handleConnectionError(connectionId, error) {
    const connection = this.connections.get(connectionId);
    if (connection) {
      this.handleDisconnection(connectionId, 1006, 'Connection error');
    }
    this.emit('connection-error', { connectionId, error });
  }

  // Public API for publishing events
  publishEvent(channel, event, options = {}) {
    if (!this.channels.has(channel)) {
      throw new Error(`Channel '${channel}' does not exist`);
    }

    const enrichedEvent = {
      id: this.generateEventId(),
      timestamp: new Date(),
      channel: channel,
      ...event,
      metadata: {
        priority: this.getChannelPriority(channel),
        ...options
      }
    };

    // Add to event queue for processing
    this.eventQueue.push({
      channel: channel,
      event: enrichedEvent,
      options: options
    });

    // Process queue
    this.processEventQueue();

    return enrichedEvent.id;
  }

  async processEventQueue() {
    if (this.isProcessingQueue || this.eventQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    try {
      while (this.eventQueue.length > 0) {
        const { channel, event, options } = this.eventQueue.shift();
        await this.processEvent(channel, event, options);
      }
    } catch (error) {
      console.error('Error processing event queue:', error);
      this.metrics.errorsCount++;
    } finally {
      this.isProcessingQueue = false;
    }
  }

  async processEvent(channel, event, options) {
    try {
      const channelInfo = this.channels.get(channel);
      if (!channelInfo) return;

      // Store in history
      this.storeEventInHistory(channel, event);

      // Update channel stats
      channelInfo.messageCount++;
      channelInfo.lastActivity = new Date();

      // Send to all subscribers
      const subscribers = Array.from(channelInfo.subscribers);
      const message = {
        type: 'event',
        channel: channel,
        event: event,
        timestamp: new Date()
      };

      const deliveryPromises = subscribers.map(connectionId => {
        return this.sendToConnectionWithFilters(connectionId, message, channel);
      });

      await Promise.allSettled(deliveryPromises);

      // Emit internal event
      this.emit('event-published', { channel, event, subscriberCount: subscribers.length });

    } catch (error) {
      console.error(`Error processing event for channel ${channel}:`, error);
      this.metrics.errorsCount++;
      throw error;
    }
  }

  storeEventInHistory(channel, event) {
    if (!this.eventHistory.has(channel)) {
      this.eventHistory.set(channel, []);
    }

    const history = this.eventHistory.get(channel);
    history.push(event);

    // Limit history size
    if (history.length > this.maxHistorySize) {
      history.splice(0, history.length - this.maxHistorySize);
    }

    // Clean old events based on retention policy
    const retention = this.getChannelRetention(channel);
    const cutoffTime = new Date(Date.now() - retention);
    
    const validEvents = history.filter(e => new Date(e.timestamp) > cutoffTime);
    this.eventHistory.set(channel, validEvents);
  }

  sendToConnection(connectionId, message) {
    const connection = this.connections.get(connectionId);
    if (!connection || connection.ws.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      connection.ws.send(JSON.stringify(message));
      connection.metadata.messagesSent++;
      return true;
    } catch (error) {
      console.error(`Error sending message to connection ${connectionId}:`, error);
      this.metrics.errorsCount++;
      return false;
    }
  }

  sendToConnectionWithFilters(connectionId, message, channel) {
    const connection = this.connections.get(connectionId);
    if (!connection) return Promise.resolve(false);

    // Apply filters if they exist
    if (connection.filters && connection.filters[channel]) {
      const filters = connection.filters[channel];
      if (!this.eventMatchesFilters(message.event, filters)) {
        return Promise.resolve(false);
      }
    }

    return Promise.resolve(this.sendToConnection(connectionId, message));
  }

  eventMatchesFilters(event, filters) {
    // Simple filter matching - can be extended
    for (const [key, value] of Object.entries(filters)) {
      if (event[key] !== undefined && event[key] !== value) {
        return false;
      }
    }
    return true;
  }

  sendError(connectionId, errorCode, errorMessage) {
    this.sendToConnection(connectionId, {
      type: 'error',
      error: {
        code: errorCode,
        message: errorMessage,
        timestamp: new Date()
      }
    });
  }

  // Broadcast to all connections in a channel
  broadcast(channel, event, options = {}) {
    return this.publishEvent(channel, event, options);
  }

  // Send to specific connections
  sendToConnections(connectionIds, message) {
    const results = connectionIds.map(connectionId => ({
      connectionId,
      success: this.sendToConnection(connectionId, message)
    }));

    return results;
  }

  // Heartbeat mechanism
  startHeartbeat() {
    setInterval(() => {
      this.performHeartbeat();
    }, this.heartbeatInterval);
  }

  performHeartbeat() {
    const deadConnections = [];

    for (const [connectionId, connection] of this.connections.entries()) {
      if (!connection.isAlive) {
        deadConnections.push(connectionId);
      } else {
        connection.isAlive = false;
        if (connection.ws.readyState === WebSocket.OPEN) {
          connection.ws.ping();
        }
      }
    }

    // Clean up dead connections
    deadConnections.forEach(connectionId => {
      this.handleDisconnection(connectionId, 1006, 'Heartbeat timeout');
    });

    if (deadConnections.length > 0) {
      console.log(`Cleaned up ${deadConnections.length} dead connections`);
    }
  }

  // Utility methods
  generateConnectionId() {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateEventId() {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Management APIs
  getConnections() {
    const connections = [];
    for (const [id, connection] of this.connections.entries()) {
      connections.push({
        id: id,
        channels: Array.from(connection.channels),
        metadata: connection.metadata,
        isAlive: connection.isAlive
      });
    }
    return connections;
  }

  getChannels() {
    const channels = [];
    for (const [name, channel] of this.channels.entries()) {
      channels.push({
        name: name,
        subscriberCount: channel.subscribers.size,
        messageCount: channel.messageCount,
        lastActivity: channel.lastActivity,
        metadata: channel.metadata
      });
    }
    return channels;
  }

  getMetrics() {
    return {
      ...this.metrics,
      uptime: Date.now() - this.metrics.startTime.getTime(),
      channelsCount: this.channels.size,
      eventQueueSize: this.eventQueue.length,
      historySize: Array.from(this.eventHistory.values()).reduce((sum, history) => sum + history.length, 0)
    };
  }

  getChannelHistory(channel, limit = 100) {
    if (!this.channels.has(channel)) {
      throw new Error(`Channel '${channel}' does not exist`);
    }

    const history = this.eventHistory.get(channel) || [];
    return history.slice(-limit);
  }

  // Cleanup methods
  closeConnection(connectionId, code = 1000, reason = 'Server initiated close') {
    const connection = this.connections.get(connectionId);
    if (connection && connection.ws.readyState === WebSocket.OPEN) {
      connection.ws.close(code, reason);
    }
  }

  closeAllConnections() {
    for (const [connectionId] of this.connections.entries()) {
      this.closeConnection(connectionId, 1001, 'Server shutdown');
    }
  }

  shutdown() {
    console.log('Shutting down Event Streaming Service...');
    
    this.closeAllConnections();
    
    if (this.wsServer) {
      this.wsServer.close((error) => {
        if (error) {
          console.error('Error closing WebSocket server:', error);
        } else {
          console.log('WebSocket server closed successfully');
        }
      });
    }

    this.emit('shutdown');
  }

  // Health check
  getHealthStatus() {
    const now = Date.now();
    const uptime = now - this.metrics.startTime.getTime();
    
    return {
      status: 'healthy',
      uptime: uptime,
      activeConnections: this.metrics.activeConnections,
      totalConnections: this.metrics.totalConnections,
      messagesProcessed: this.metrics.messagesProcessed,
      errorsCount: this.metrics.errorsCount,
      errorRate: this.metrics.messagesProcessed > 0 ? (this.metrics.errorsCount / this.metrics.messagesProcessed) * 100 : 0,
      eventQueueSize: this.eventQueue.length,
      isProcessingQueue: this.isProcessingQueue,
      channelsActive: Array.from(this.channels.values()).filter(c => c.subscribers.size > 0).length,
      timestamp: new Date()
    };
  }
}

module.exports = new EventStreamingService();