# FitClub API Documentation

**Base URL**: `http://localhost:3000` (Local Development)

## 1. Authentication

### Google Login
Initiates the Google OAuth2 flow.
- **Endpoint**: `GET /auth/google`
- **Description**: Redirects the user to Google's consent screen.
- **Query Params**: None

### Google Callback
Handles the redirect from Google after successful authentication.
- **Endpoint**: `GET /auth/google/callback`
- **Description**: Processes the auth code, creates/updates the user, and redirects to the frontend dashboard.
- **Redirects To**: 
  - Success: `{FRONTEND_URL}/dashboard?success=true&userId={userId}&name={name}`
  - Failure: `{FRONTEND_URL}/dashboard?success=false&error={errorMessage}`

---

## 2. Users

### Create User
Manually create a new user.
- **Endpoint**: `POST /users`
- **Content-Type**: `application/json`
- **Body**:
  ```json
  {
    "name": "John Doe",           // Required, String
    "email": "john@example.com",  // Required, Valid Email
    "googleAccessToken": "...",   // Optional, String
    "googleRefreshToken": "..."   // Optional, String
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "id": "uuid-string",
    "name": "John Doe",
    "email": "john@example.com",
    "totalSteps": 0,
    ...
  }
  ```

### Get All Users
Retrieve a list of all registered users.
- **Endpoint**: `GET /users`
- **Response**: `200 OK`
  ```json
  [
    {
      "id": "uuid-string",
      "name": "John Doe",
      "email": "john@example.com",
      "totalSteps": 15000
    },
    ...
  ]
  ```

---

## 3. Steps

### Create Step Record
Manually record steps for a user.
- **Endpoint**: `POST /steps`
- **Content-Type**: `application/json`
- **Body**:
  ```json
  {
    "userId": "uuid-string",  // Required, UUID of the user
    "steps": 5000             // Required, Integer >= 0
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "id": "record-uuid",
    "userId": "user-uuid",
    "date": "2023-10-27",
    "steps": 5000
  }
  ```

### Get Steps by User
Retrieve step history for a specific user.
- **Endpoint**: `GET /steps/:userId`
- **Params**:
  - `userId`: The UUID of the user.
- **Response**: `200 OK`
  ```json
  [
    {
      "id": "record-uuid",
      "date": "2023-10-27",
      "steps": 5000
    },
    ...
  ]
  ```

### Sync from Google Fit
Manually trigger a sync with Google Fit for a specific user.
- **Endpoint**: `PUT /steps/sync/:userId`
- **Params**:
  - `userId`: The UUID of the user.
- **Description**: Fetches the latest step data from Google Fit for the user (requires user to have connected Google Fit).
- **Response**: `200 OK`
  ```json
  {
    "id": "record-uuid",
    "date": "2023-10-27",
    "steps": 7500 // Updated count
  }
  ```

---

## 4. Leaderboard

### Get Leaderboard
Retrieve the global leaderboard sorted by total steps.
- **Endpoint**: `GET /leaderboard`
- **Response**: `200 OK`
  ```json
  [
    {
      "id": "user-uuid-1",
      "name": "Alice",
      "totalSteps": 50000
    },
    {
      "id": "user-uuid-2",
      "name": "Bob",
      "totalSteps": 45000
    }
  ]
  ```
