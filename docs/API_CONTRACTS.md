# Avalmeo's Travel API Documentation

## API Contracts for CRUD System with Bidirectional Synchronization

---

## Base URL

```
http://localhost:3000/api
```

## Authentication

All admin endpoints require JWT authentication via Bearer token:

```
Authorization: Bearer <token>
```

Public endpoints (GET) do not require authentication.

---

## Destinations API

### Get All Destinations (Public)

```http
GET /api/destinations
GET /api/destinations?featured=true
GET /api/destinations?search=baguio
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Baguio City",
      "slug": "baguio-city",
      "description": "The Summer Capital of the Philippines",
      "short_description": "Mountain city with cool climate",
      "location": "Benguet",
      "region": "Cordillera Administrative Region",
      "country": "Philippines",
      "latitude": 16.4023,
      "longitude": 120.5960,
      "hero_image": "Picture/Baguio.jpg",
      "highlights": ["Session Road", "Mines View Park", "Burnham Park"],
      "best_time_to_visit": "January to May",
      "average_rating": 4.5,
      "total_reviews": 1234,
      "is_featured": true,
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-02T00:00:00Z"
    }
  ]
}
```

### Get All Destinations (Admin)

```http
GET /api/admin/destinations/all
GET /api/admin/destinations/all?search=baguio
GET /api/admin/destinations/all?is_active=true
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "total": 10
}
```

### Get Single Destination (Admin)

```http
GET /api/admin/destinations/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Baguio City",
    "slug": "baguio-city",
    ...
  }
}
```

### Create Destination (Admin)

```http
POST /api/admin/destinations
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "New Destination",
  "slug": "new-destination",
  "description": "Description here",
  "short_description": "Short description",
  "location": "Location",
  "region": "Region",
  "country": "Philippines",
  "latitude": 12.8797,
  "longitude": 121.7740,
  "hero_image": "Picture/destination.jpg",
  "highlights": ["Highlight 1", "Highlight 2"],
  "best_time_to_visit": "Best months",
  "is_featured": false,
  "is_active": true
}
```

**Validation Rules:**
- `name`: Required, 2-100 characters
- `slug`: Required, lowercase letters, numbers, hyphens only
- `location`: Required, max 200 characters
- `region`: Required, max 100 characters

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "New Destination",
    "slug": "new-destination",
    ...
  }
}
```

**Error Response (Validation Failed):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "Name must be at least 2 characters"
    },
    {
      "field": "slug",
      "message": "Slug must contain only lowercase letters, numbers, and hyphens"
    }
  ]
}
```

### Update Destination (Admin)

```http
PUT /api/admin/destinations/{id}
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Updated Name",
  "description": "Updated description",
  "is_featured": true
}
```

### Deactivate Destination (Soft Delete)

```http
PATCH /api/admin/destinations/{id}/deactivate
Authorization: Bearer <token>
```

### Activate Destination (Restore)

```http
PATCH /api/admin/destinations/{id}/activate
Authorization: Bearer <token>
```

### Delete Destination (Permanent)

```http
DELETE /api/admin/destinations/{id}
Authorization: Bearer <token>
```

**Success Response:**
```json
{
  "success": true,
  "message": "Destination deleted successfully"
}
```

---

## Activities API

### Get All Activities (Public)

```http
GET /api/activities
GET /api/activities?destination_id=uuid
GET /api/activities?featured=true
GET /api/activities?search=tour
```

### Get All Activities (Admin)

```http
GET /api/admin/activities/all
GET /api/admin/activities/all?destination_id=uuid
GET /api/admin/activities/all?search=tour
```

### Create Activity (Admin)

```http
POST /api/admin/activities
Content-Type: application/json
Authorization: Bearer <token>

{
  "destination_id": "uuid",
  "name": "New Activity",
  "slug": "new-activity",
  "description": "Activity description",
  "short_description": "Short description",
  "activity_type": "tour",
  "duration": "4 hours",
  "difficulty": "moderate",
  "max_group_size": 15,
  "price": 500,
  "discount_price": null,
  "currency": "PHP",
  "hero_image": "Picture/activity.jpg",
  "inclusions": ["Item 1", "Item 2"],
  "exclusions": ["Item 1", "Item 2"],
  "requirements": "Requirements",
  "cancellation_policy": "Policy",
  "is_featured": false,
  "is_active": true
}
```

**Validation Rules:**
- `name`: Required, 2-200 characters
- `slug`: Required, lowercase letters, numbers, hyphens only
- `destination_id`: Required, valid UUID
- `activity_type`: Required, one of: tour, adventure, water, cultural, nature, food, relaxation, other
- `price`: Required, must be non-negative number

### Update Activity (Admin)

```http
PUT /api/admin/activities/{id}
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Updated Activity",
  "price": 600
}
```

### Delete Activity (Admin)

```http
DELETE /api/admin/activities/{id}
Authorization: Bearer <token>
```

---

## Packages API

### Get All Packages (Public)

```http
GET /api/packages
GET /api/packages?is_active=true
```

### Get All Packages (Admin)

```http
GET /api/admin/packages/all
GET /api/admin/packages/all?destination_id=uuid
GET /api/admin/packages/all?search=baguio
GET /api/admin/packages/all?is_featured=true
```

### Create Package (Admin)

```http
POST /api/admin/packages
Content-Type: application/json
Authorization: Bearer <token>

{
  "destination_id": "uuid",
  "name": "New Package",
  "slug": "new-package",
  "description": "Package description",
  "short_description": "Short description",
  "price": 5000,
  "duration": 3,
  "package_type": "all-inclusive",
  "hero_image": "Picture/package.jpg",
  "gallery": ["Picture/1.jpg", "Picture/2.jpg"],
  "activities": ["Activity 1", "Activity 2"],
  "inclusions": ["Inclusion 1", "Inclusion 2"],
  "exclusions": ["Exclusion 1", "Exclusion 2"],
  "is_featured": false,
  "is_active": true
}
```

### Update Package (Admin)

```http
PUT /api/admin/packages/{id}
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Updated Package",
  "price": 6000,
  "is_featured": true
}
```

### Delete Package (Admin)

```http
DELETE /api/admin/packages/{id}
Authorization: Bearer <token>
```

---

## Error Responses

### Validation Error

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "Name must be at least 2 characters"
    }
  ]
}
```

### Authentication Error

```json
{
  "success": false,
  "message": "Not authenticated"
}
```

### Authorization Error

```json
{
  "success": false,
  "message": "Admin access required"
}
```

### Not Found Error

```json
{
  "success": false,
  "message": "Destination not found"
}
```

### Server Error

```json
{
  "success": false,
  "message": "Server error",
  "error": "Detailed error message"
}
```

---

## Synchronization Events

### Cross-Tab Synchronization (BroadcastChannel)

Uses BroadcastChannel API for same-browser sync:

```javascript
// In admin, after save/delete:
window.adminBroadcastChannel.postMessage({
  type: 'DATA_CHANGE',
  table: 'destinations',
  changeType: 'INSERT', // INSERT, UPDATE, DELETE
  data: destinationData
});

// In home page, listening:
window.realtimeSync.channel.onmessage = (event) => {
  const { table, changeType, data } = event.data;
  if (table === 'destinations') {
    // Handle the change
    loadDestinations(); // Refresh from API
  }
};
```

### Polling Fallback

Home page polls `/api/destinations` every 30 seconds:

```javascript
// In js/realtime-sync.js
setInterval(async () => {
  const response = await fetch('/api/destinations');
  const data = await response.json();
  if (data.success) {
    // Compare with cached data and update if changed
    compareAndUpdate(data.data);
  }
}, 30000); // 30 seconds
```

---

## Frontend State Management

### StateManager Usage

```javascript
// Initialize (automatically done)
const stateManager = window.stateManager;

// Subscribe to changes
const unsubscribe = stateManager.subscribe('destinations', (operation, data) => {
  console.log(`${operation} on destination:`, data);
});

// Fetch data with caching
const destinations = await stateManager.fetchDestinations({ forceRefresh: false });

// Optimistic CRUD operations
await stateManager.createDestination({ name: 'New', slug: 'new', ... });
await stateManager.updateDestination(id, { name: 'Updated' });
await stateManager.deleteDestination(id);

// Get cache status
const status = stateManager.getCacheStatus();
console.log(status.destinations);
```

### AdminApiService Usage

```javascript
// Initialize
const adminApi = new AdminApiService();

// Destinations
const destinations = await adminApi.getDestinations();
const destination = await adminApi.getDestination(id);
await adminApi.saveDestination({ name: 'New', ... });
await adminApi.deleteDestination(id);

// Activities
const activities = await adminApi.getActivities();
await adminApi.saveActivity({ name: 'New', ... });
await adminApi.deleteActivity(id);

// Packages
const packages = await adminApi.getPackages();
await adminApi.savePackage({ name: 'New', ... });
await adminApi.deletePackage(id);
```

### BroadcastChannel Functions

```javascript
// Broadcast change to other tabs (called after CRUD operations)
window.broadcastAdminChange = function(table, type, data) {
  window.adminBroadcastChannel.postMessage({
    type: 'DATA_CHANGE',
    table: table,
    changeType: type,
    data: data,
    timestamp: new Date().toISOString()
  });
};

// Listen for changes (called in home page initialization)
window.adminBroadcastChannel.onmessage = function(event) {
  const { table, changeType, data } = event.data;
  if (table === 'destinations') {
    console.log(`Destination ${changeType}:`, data);
    loadDestinations(); // Refresh from API
  }
};
```

---

## Testing

### Running Unit Tests

```bash
node tests/unit/state-manager.test.js
```

### API Testing with curl

```bash
# Test public endpoint
curl http://localhost:3000/api/destinations

# Test admin endpoint (replace TOKEN with actual JWT)
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/admin/destinations/all

# Create destination
curl -X POST \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","slug":"test","location":"Test","region":"Test"}' \
  http://localhost:3000/api/admin/destinations
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-02-10 | Initial implementation with CRUD and sync |
| 1.1.0 | 2024-02-10 | Added BroadcastChannel, fixed missing endpoints |

---

**Document Version:** 1.1.0  
**Last Updated:** 2024-02-10
