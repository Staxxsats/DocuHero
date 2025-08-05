const EventEmitter = require('events');

class GeolocationService extends EventEmitter {
  constructor() {
    super();
    this.activeTracking = new Map();
    this.locationHistory = new Map();
    this.geofences = new Map();
    this.emergencyContacts = new Map();
    this.proximityAlerts = new Map();
    
    this.settings = {
      trackingInterval: 60000, // 1 minute
      highAccuracyMode: false,
      maxLocationAge: 300000, // 5 minutes
      distanceThreshold: 100, // meters
      emergencyRadius: 500, // meters
      maxHistoryEntries: 1000,
      privacyMode: false,
      encryptLocation: true
    };

    this.metrics = {
      totalLocationUpdates: 0,
      activeUsers: 0,
      geofenceViolations: 0,
      emergencyAlerts: 0,
      lastUpdate: null
    };

    this.startLocationTracking();
    this.startGeofenceMonitoring();
    this.startProximityMonitoring();
  }

  // User tracking registration
  async registerUser(userId, userInfo = {}) {
    try {
      if (this.activeTracking.has(userId)) {
        console.warn(`User ${userId} already registered for tracking`);
        return this.activeTracking.get(userId);
      }

      const trackingData = {
        userId: userId,
        userInfo: {
          name: userInfo.name || `User ${userId}`,
          role: userInfo.role || 'healthcare_worker',
          department: userInfo.department || 'general',
          shift: userInfo.shift || 'day',
          emergencyContact: userInfo.emergencyContact,
          medicalInfo: userInfo.medicalInfo,
          ...userInfo
        },
        currentLocation: null,
        lastKnownLocation: null,
        lastUpdate: null,
        isActive: false,
        trackingEnabled: true,
        accuracy: null,
        battery: null,
        networkStatus: 'unknown',
        emergencyMode: false,
        alertsEnabled: true,
        geofenceSubscriptions: new Set(),
        proximitySubscriptions: new Set()
      };

      this.activeTracking.set(userId, trackingData);
      this.initializeUserHistory(userId);

      console.log(`User ${userId} registered for geolocation tracking`);
      this.emit('user-registered', { userId, userInfo: trackingData.userInfo });

      return trackingData;

    } catch (error) {
      console.error(`Error registering user ${userId}:`, error);
      throw error;
    }
  }

  initializeUserHistory(userId) {
    if (!this.locationHistory.has(userId)) {
      this.locationHistory.set(userId, []);
    }
  }

  // Location updates
  async updateLocation(userId, locationData) {
    try {
      const user = this.activeTracking.get(userId);
      if (!user) {
        throw new Error(`User ${userId} not registered for tracking`);
      }

      if (!user.trackingEnabled) {
        console.log(`Tracking disabled for user ${userId}`);
        return false;
      }

      const now = new Date();
      const location = this.processLocationData(locationData);

      // Validate location data
      if (!this.isValidLocation(location)) {
        throw new Error('Invalid location data provided');
      }

      // Store previous location
      user.lastKnownLocation = user.currentLocation;
      
      // Update current location
      user.currentLocation = {
        ...location,
        timestamp: now,
        userId: userId
      };
      
      user.lastUpdate = now;
      user.isActive = true;
      user.accuracy = location.accuracy || null;

      // Add to history
      this.addToLocationHistory(userId, user.currentLocation);

      // Check for significant movement
      const movement = this.calculateMovement(user.lastKnownLocation, user.currentLocation);
      
      // Process geofences
      await this.processGeofences(userId, user.currentLocation);

      // Check proximity alerts
      await this.processProximityAlerts(userId, user.currentLocation);

      // Check for emergency situations
      await this.checkEmergencyConditions(userId, user.currentLocation, movement);

      // Update metrics
      this.metrics.totalLocationUpdates++;
      this.metrics.lastUpdate = now;
      this.updateActiveUserCount();

      this.emit('location-updated', {
        userId,
        location: user.currentLocation,
        movement: movement,
        timestamp: now
      });

      console.log(`Location updated for user ${userId}: ${location.latitude}, ${location.longitude}`);
      return true;

    } catch (error) {
      console.error(`Error updating location for user ${userId}:`, error);
      this.emit('location-error', { userId, error: error.message });
      throw error;
    }
  }

  processLocationData(locationData) {
    // Process and sanitize location data
    const processed = {
      latitude: parseFloat(locationData.latitude),
      longitude: parseFloat(locationData.longitude),
      altitude: locationData.altitude ? parseFloat(locationData.altitude) : null,
      accuracy: locationData.accuracy ? parseFloat(locationData.accuracy) : null,
      speed: locationData.speed ? parseFloat(locationData.speed) : null,
      heading: locationData.heading ? parseFloat(locationData.heading) : null,
      timestamp: locationData.timestamp ? new Date(locationData.timestamp) : new Date()
    };

    // Encrypt coordinates if privacy mode is enabled
    if (this.settings.encryptLocation) {
      processed.encryptedCoordinates = this.encryptCoordinates(processed.latitude, processed.longitude);
    }

    return processed;
  }

  isValidLocation(location) {
    if (!location.latitude || !location.longitude) return false;
    if (isNaN(location.latitude) || isNaN(location.longitude)) return false;
    if (Math.abs(location.latitude) > 90 || Math.abs(location.longitude) > 180) return false;
    return true;
  }

  addToLocationHistory(userId, location) {
    const history = this.locationHistory.get(userId);
    
    history.push({
      ...location,
      recordedAt: new Date()
    });

    // Limit history size
    if (history.length > this.settings.maxHistoryEntries) {
      history.splice(0, history.length - this.settings.maxHistoryEntries);
    }
  }

  calculateMovement(previousLocation, currentLocation) {
    if (!previousLocation || !currentLocation) {
      return { distance: 0, bearing: null, speed: null };
    }

    const distance = this.calculateDistance(
      previousLocation.latitude, previousLocation.longitude,
      currentLocation.latitude, currentLocation.longitude
    );

    const bearing = this.calculateBearing(
      previousLocation.latitude, previousLocation.longitude,
      currentLocation.latitude, currentLocation.longitude
    );

    const timeDiff = (currentLocation.timestamp - previousLocation.timestamp) / 1000; // seconds
    const speed = timeDiff > 0 ? (distance / timeDiff) * 3.6 : null; // km/h

    return {
      distance: Math.round(distance),
      bearing: Math.round(bearing),
      speed: speed ? Math.round(speed * 10) / 10 : null,
      timeDiff: timeDiff
    };
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in meters
  }

  calculateBearing(lat1, lon1, lat2, lon2) {
    const dLon = this.toRadians(lon2 - lon1);
    const y = Math.sin(dLon) * Math.cos(this.toRadians(lat2));
    const x = Math.cos(this.toRadians(lat1)) * Math.sin(this.toRadians(lat2)) -
              Math.sin(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * Math.cos(dLon);
    
    return (this.toDegrees(Math.atan2(y, x)) + 360) % 360;
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  toDegrees(radians) {
    return radians * (180 / Math.PI);
  }

  // Geofencing
  createGeofence(geofenceId, definition) {
    try {
      const geofence = {
        id: geofenceId,
        name: definition.name || `Geofence ${geofenceId}`,
        type: definition.type || 'circular', // circular, polygon
        center: definition.center, // { latitude, longitude }
        radius: definition.radius || 100, // meters
        polygon: definition.polygon || null, // array of coordinates
        alertType: definition.alertType || 'both', // enter, exit, both
        priority: definition.priority || 'medium',
        isActive: definition.isActive !== false,
        createdAt: new Date(),
        createdBy: definition.createdBy,
        metadata: definition.metadata || {},
        subscribers: new Set()
      };

      this.geofences.set(geofenceId, geofence);

      console.log(`Geofence created: ${geofenceId}`);
      this.emit('geofence-created', { geofenceId, geofence });

      return geofence;

    } catch (error) {
      console.error(`Error creating geofence ${geofenceId}:`, error);
      throw error;
    }
  }

  subscribeToGeofence(userId, geofenceId) {
    const user = this.activeTracking.get(userId);
    const geofence = this.geofences.get(geofenceId);

    if (!user || !geofence) {
      throw new Error('User or geofence not found');
    }

    user.geofenceSubscriptions.add(geofenceId);
    geofence.subscribers.add(userId);

    console.log(`User ${userId} subscribed to geofence ${geofenceId}`);
    this.emit('geofence-subscription', { userId, geofenceId });
  }

  async processGeofences(userId, location) {
    const user = this.activeTracking.get(userId);
    if (!user || user.geofenceSubscriptions.size === 0) return;

    for (const geofenceId of user.geofenceSubscriptions) {
      const geofence = this.geofences.get(geofenceId);
      if (!geofence || !geofence.isActive) continue;

      const wasInside = user.lastKnownLocation ? this.isInsideGeofence(user.lastKnownLocation, geofence) : false;
      const isInside = this.isInsideGeofence(location, geofence);

      let alertType = null;
      if (!wasInside && isInside && (geofence.alertType === 'enter' || geofence.alertType === 'both')) {
        alertType = 'enter';
      } else if (wasInside && !isInside && (geofence.alertType === 'exit' || geofence.alertType === 'both')) {
        alertType = 'exit';
      }

      if (alertType) {
        await this.triggerGeofenceAlert(userId, geofenceId, alertType, location);
      }
    }
  }

  isInsideGeofence(location, geofence) {
    if (geofence.type === 'circular') {
      const distance = this.calculateDistance(
        location.latitude, location.longitude,
        geofence.center.latitude, geofence.center.longitude
      );
      return distance <= geofence.radius;
    } else if (geofence.type === 'polygon') {
      return this.isInsidePolygon(location, geofence.polygon);
    }
    return false;
  }

  isInsidePolygon(location, polygon) {
    let inside = false;
    const x = location.longitude;
    const y = location.latitude;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].longitude;
      const yi = polygon[i].latitude;
      const xj = polygon[j].longitude;
      const yj = polygon[j].latitude;

      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }

    return inside;
  }

  async triggerGeofenceAlert(userId, geofenceId, alertType, location) {
    const user = this.activeTracking.get(userId);
    const geofence = this.geofences.get(geofenceId);

    const alert = {
      type: 'geofence',
      userId: userId,
      userName: user.userInfo.name,
      geofenceId: geofenceId,
      geofenceName: geofence.name,
      alertType: alertType,
      location: location,
      timestamp: new Date(),
      priority: geofence.priority
    };

    this.metrics.geofenceViolations++;

    console.log(`Geofence alert: User ${userId} ${alertType} geofence ${geofenceId}`);
    this.emit('geofence-alert', alert);

    // Send notifications based on priority
    if (geofence.priority === 'high' || geofence.priority === 'critical') {
      await this.sendUrgentNotification(alert);
    }
  }

  // Proximity monitoring
  createProximityAlert(alertId, definition) {
    const alert = {
      id: alertId,
      name: definition.name || `Proximity Alert ${alertId}`,
      targetUsers: new Set(definition.targetUsers || []),
      radius: definition.radius || 50, // meters
      alertWhen: definition.alertWhen || 'close', // close, far, both
      priority: definition.priority || 'medium',
      isActive: definition.isActive !== false,
      createdAt: new Date(),
      lastTriggered: null,
      cooldownPeriod: definition.cooldownPeriod || 300000, // 5 minutes
      metadata: definition.metadata || {}
    };

    this.proximityAlerts.set(alertId, alert);

    console.log(`Proximity alert created: ${alertId}`);
    this.emit('proximity-alert-created', { alertId, alert });

    return alert;
  }

  async processProximityAlerts(userId, location) {
    const user = this.activeTracking.get(userId);
    if (!user) return;

    for (const [alertId, alert] of this.proximityAlerts.entries()) {
      if (!alert.isActive || !alert.targetUsers.has(userId)) continue;

      // Check cooldown period
      if (alert.lastTriggered && (Date.now() - alert.lastTriggered.getTime()) < alert.cooldownPeriod) {
        continue;
      }

      // Find other users in proximity
      for (const [otherUserId, otherUser] of this.activeTracking.entries()) {
        if (otherUserId === userId || !otherUser.currentLocation || !alert.targetUsers.has(otherUserId)) {
          continue;
        }

        const distance = this.calculateDistance(
          location.latitude, location.longitude,
          otherUser.currentLocation.latitude, otherUser.currentLocation.longitude
        );

        const isClose = distance <= alert.radius;
        const shouldAlert = (alert.alertWhen === 'close' && isClose) || 
                           (alert.alertWhen === 'far' && !isClose) ||
                           (alert.alertWhen === 'both');

        if (shouldAlert) {
          await this.triggerProximityAlert(alertId, userId, otherUserId, distance, location);
          alert.lastTriggered = new Date();
        }
      }
    }
  }

  async triggerProximityAlert(alertId, userId1, userId2, distance, location) {
    const user1 = this.activeTracking.get(userId1);
    const user2 = this.activeTracking.get(userId2);
    const alert = this.proximityAlerts.get(alertId);

    const proximityEvent = {
      type: 'proximity',
      alertId: alertId,
      alertName: alert.name,
      users: [
        { id: userId1, name: user1.userInfo.name, role: user1.userInfo.role },
        { id: userId2, name: user2.userInfo.name, role: user2.userInfo.role }
      ],
      distance: Math.round(distance),
      location: location,
      timestamp: new Date(),
      priority: alert.priority
    };

    console.log(`Proximity alert: Users ${userId1} and ${userId2} are ${distance}m apart`);
    this.emit('proximity-alert', proximityEvent);

    if (alert.priority === 'high' || alert.priority === 'critical') {
      await this.sendUrgentNotification(proximityEvent);
    }
  }

  // Emergency handling
  async triggerEmergency(userId, emergencyType = 'general', additionalInfo = {}) {
    try {
      const user = this.activeTracking.get(userId);
      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      const emergency = {
        id: `emergency_${Date.now()}_${userId}`,
        type: emergencyType,
        userId: userId,
        userName: user.userInfo.name,
        userInfo: user.userInfo,
        location: user.currentLocation,
        triggeredAt: new Date(),
        status: 'active',
        priority: 'critical',
        additionalInfo: additionalInfo,
        respondedBy: null,
        resolvedAt: null
      };

      // Set user to emergency mode
      user.emergencyMode = true;

      // Store emergency
      if (!this.emergencyContacts.has(userId)) {
        this.emergencyContacts.set(userId, []);
      }
      this.emergencyContacts.get(userId).push(emergency);

      this.metrics.emergencyAlerts++;

      console.log(`EMERGENCY: ${emergencyType} triggered by user ${userId}`);
      this.emit('emergency-triggered', emergency);

      // Send immediate notifications
      await this.sendEmergencyNotifications(emergency);

      // Start enhanced tracking
      await this.startEmergencyTracking(userId);

      return emergency;

    } catch (error) {
      console.error(`Error triggering emergency for user ${userId}:`, error);
      throw error;
    }
  }

  async checkEmergencyConditions(userId, location, movement) {
    const user = this.activeTracking.get(userId);
    if (!user || user.emergencyMode) return;

    // Check for no movement for extended period (potential medical emergency)
    if (movement.distance === 0 && user.lastKnownLocation) {
      const timeSinceLastMovement = Date.now() - user.lastKnownLocation.timestamp.getTime();
      if (timeSinceLastMovement > 3600000) { // 1 hour
        await this.triggerEmergency(userId, 'no_movement', {
          lastMovement: user.lastKnownLocation.timestamp,
          duration: timeSinceLastMovement
        });
      }
    }

    // Check if user is in unauthorized area during off-hours
    const now = new Date();
    const hour = now.getHours();
    if ((hour < 6 || hour > 22) && user.userInfo.shift === 'day') {
      // Could trigger security alert
      this.emit('security-alert', {
        userId: userId,
        type: 'unauthorized_hours',
        location: location,
        timestamp: now
      });
    }
  }

  async startEmergencyTracking(userId) {
    const user = this.activeTracking.get(userId);
    if (!user) return;

    // Increase tracking frequency for emergency situations
    user.emergencyTrackingInterval = setInterval(async () => {
      if (!user.emergencyMode) {
        clearInterval(user.emergencyTrackingInterval);
        return;
      }

      // Request immediate location update
      this.emit('request-location-update', { userId, priority: 'emergency' });
    }, 30000); // Every 30 seconds during emergency

    console.log(`Emergency tracking started for user ${userId}`);
  }

  async sendEmergencyNotifications(emergency) {
    // Send to emergency contacts
    const notifications = [
      {
        type: 'emergency',
        priority: 'critical',
        recipient: 'emergency_services',
        message: `Emergency alert: ${emergency.type} - ${emergency.userName} at ${emergency.location?.latitude}, ${emergency.location?.longitude}`,
        emergency: emergency
      },
      {
        type: 'emergency',
        priority: 'critical',
        recipient: 'supervisors',
        message: `Staff emergency: ${emergency.userName} requires immediate assistance`,
        emergency: emergency
      }
    ];

    for (const notification of notifications) {
      this.emit('send-notification', notification);
    }
  }

  // Tracking lifecycle
  startLocationTracking() {
    this.trackingInterval = setInterval(() => {
      this.processLocationTracking();
    }, this.settings.trackingInterval);

    console.log('Geolocation tracking service started');
  }

  processLocationTracking() {
    const now = Date.now();
    
    for (const [userId, user] of this.activeTracking.entries()) {
      if (!user.trackingEnabled) continue;

      // Check for stale locations
      if (user.lastUpdate && (now - user.lastUpdate.getTime()) > this.settings.maxLocationAge) {
        user.isActive = false;
        this.emit('user-inactive', { userId, lastUpdate: user.lastUpdate });
      }

      // Request location update for active users
      if (user.isActive && user.trackingEnabled) {
        this.emit('request-location-update', { userId, priority: 'normal' });
      }
    }

    this.updateActiveUserCount();
  }

  updateActiveUserCount() {
    const activeCount = Array.from(this.activeTracking.values()).filter(user => user.isActive).length;
    this.metrics.activeUsers = activeCount;
  }

  stopLocationTracking() {
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }

    // Stop all emergency tracking
    for (const [userId, user] of this.activeTracking.entries()) {
      if (user.emergencyTrackingInterval) {
        clearInterval(user.emergencyTrackingInterval);
      }
    }

    console.log('Geolocation tracking service stopped');
  }

  startGeofenceMonitoring() {
    console.log('Geofence monitoring started');
  }

  startProximityMonitoring() {
    console.log('Proximity monitoring started');
  }

  // User management
  async enableTracking(userId) {
    const user = this.activeTracking.get(userId);
    if (user) {
      user.trackingEnabled = true;
      console.log(`Tracking enabled for user ${userId}`);
      this.emit('tracking-enabled', { userId });
      return true;
    }
    return false;
  }

  async disableTracking(userId) {
    const user = this.activeTracking.get(userId);
    if (user) {
      user.trackingEnabled = false;
      user.isActive = false;
      console.log(`Tracking disabled for user ${userId}`);
      this.emit('tracking-disabled', { userId });
      return true;
    }
    return false;
  }

  unregisterUser(userId) {
    const user = this.activeTracking.get(userId);
    if (!user) return false;

    // Clean up emergency tracking
    if (user.emergencyTrackingInterval) {
      clearInterval(user.emergencyTrackingInterval);
    }

    // Remove from geofences
    for (const geofenceId of user.geofenceSubscriptions) {
      const geofence = this.geofences.get(geofenceId);
      if (geofence) {
        geofence.subscribers.delete(userId);
      }
    }

    // Clean up data
    this.activeTracking.delete(userId);
    this.locationHistory.delete(userId);
    this.emergencyContacts.delete(userId);

    console.log(`User ${userId} unregistered from geolocation service`);
    this.emit('user-unregistered', { userId });

    return true;
  }

  // Data retrieval
  getUserLocation(userId) {
    const user = this.activeTracking.get(userId);
    return user ? user.currentLocation : null;
  }

  getUsersInArea(center, radius) {
    const usersInArea = [];
    
    for (const [userId, user] of this.activeTracking.entries()) {
      if (!user.currentLocation || !user.isActive) continue;

      const distance = this.calculateDistance(
        center.latitude, center.longitude,
        user.currentLocation.latitude, user.currentLocation.longitude
      );

      if (distance <= radius) {
        usersInArea.push({
          userId: userId,
          name: user.userInfo.name,
          role: user.userInfo.role,
          location: user.currentLocation,
          distance: Math.round(distance)
        });
      }
    }

    return usersInArea.sort((a, b) => a.distance - b.distance);
  }

  getLocationHistory(userId, limit = 100) {
    const history = this.locationHistory.get(userId) || [];
    return history.slice(-limit);
  }

  getAllActiveUsers() {
    const activeUsers = [];
    
    for (const [userId, user] of this.activeTracking.entries()) {
      if (user.isActive) {
        activeUsers.push({
          userId: userId,
          name: user.userInfo.name,
          role: user.userInfo.role,
          department: user.userInfo.department,
          location: user.currentLocation,
          lastUpdate: user.lastUpdate,
          emergencyMode: user.emergencyMode
        });
      }
    }

    return activeUsers;
  }

  // Utility methods
  encryptCoordinates(latitude, longitude) {
    // Simple encryption simulation - use proper encryption in production
    const encrypted = Buffer.from(`${latitude},${longitude}`).toString('base64');
    return encrypted;
  }

  decryptCoordinates(encryptedCoordinates) {
    try {
      const decrypted = Buffer.from(encryptedCoordinates, 'base64').toString('ascii');
      const [latitude, longitude] = decrypted.split(',').map(parseFloat);
      return { latitude, longitude };
    } catch (error) {
      console.error('Error decrypting coordinates:', error);
      return null;
    }
  }

  async sendUrgentNotification(alert) {
    const notification = {
      type: 'urgent',
      priority: 'high',
      alert: alert,
      timestamp: new Date()
    };

    this.emit('urgent-notification', notification);
  }

  // Configuration
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    console.log('Geolocation settings updated:', newSettings);
    this.emit('settings-updated', this.settings);
  }

  getSettings() {
    return { ...this.settings };
  }

  // Metrics and reporting
  getMetrics() {
    return {
      ...this.metrics,
      registeredUsers: this.activeTracking.size,
      activeGeofences: Array.from(this.geofences.values()).filter(g => g.isActive).length,
      proximityAlerts: this.proximityAlerts.size,
      emergencyContacts: this.emergencyContacts.size
    };
  }

  generateLocationReport(userId, timeRange = '24h') {
    const user = this.activeTracking.get(userId);
    if (!user) return null;

    const history = this.getLocationHistory(userId, 1000);
    const now = Date.now();
    const timeRangeMs = timeRange === '24h' ? 24 * 60 * 60 * 1000 : 
                       timeRange === '7d' ? 7 * 24 * 60 * 60 * 1000 : 
                       60 * 60 * 1000; // 1h default

    const relevantHistory = history.filter(loc => 
      (now - new Date(loc.timestamp).getTime()) <= timeRangeMs
    );

    let totalDistance = 0;
    for (let i = 1; i < relevantHistory.length; i++) {
      const prev = relevantHistory[i - 1];
      const curr = relevantHistory[i];
      totalDistance += this.calculateDistance(
        prev.latitude, prev.longitude,
        curr.latitude, curr.longitude
      );
    }

    return {
      userId: userId,
      userName: user.userInfo.name,
      timeRange: timeRange,
      reportGeneratedAt: new Date(),
      summary: {
        totalLocations: relevantHistory.length,
        totalDistance: Math.round(totalDistance),
        averageAccuracy: relevantHistory.reduce((sum, loc) => sum + (loc.accuracy || 0), 0) / relevantHistory.length,
        timeActive: relevantHistory.length > 0 ? 
          new Date(relevantHistory[relevantHistory.length - 1].timestamp) - new Date(relevantHistory[0].timestamp) : 0
      },
      locations: relevantHistory
    };
  }

  // Health check
  getHealthStatus() {
    const activeUsers = Array.from(this.activeTracking.values()).filter(user => user.isActive).length;
    const emergencyUsers = Array.from(this.activeTracking.values()).filter(user => user.emergencyMode).length;

    return {
      status: emergencyUsers > 0 ? 'emergency' : activeUsers > 0 ? 'active' : 'idle',
      activeUsers: activeUsers,
      emergencyUsers: emergencyUsers,
      registeredUsers: this.activeTracking.size,
      activeGeofences: Array.from(this.geofences.values()).filter(g => g.isActive).length,
      proximityAlerts: this.proximityAlerts.size,
      metrics: this.getMetrics(),
      lastActivity: this.metrics.lastUpdate,
      timestamp: new Date()
    };
  }
}

module.exports = new GeolocationService();