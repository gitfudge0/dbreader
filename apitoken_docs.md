### Mobile App Authentication Flow

1. **Get Client ID**
   ```
   Visit: https://real-debrid.com/apitoken
   Click: "Click here to generate a client ID for open source applications"
   Save the generated client_id
   ```

2. **Get Device Code**
   - Use the "Get Device Code" request in Postman
   - This returns:
     ```json
     {
       "device_code": "DEVICE_CODE_HERE",
       "user_code": "USER_CODE_HERE",
       "verification_url": "https://real-debrid.com/device",
       "expires_in": 600,
       "interval": 5
     }
   ```
   - Save the `device_code`

3. **User Verification**
   ```
   Direct user to visit: https://real-debrid.com/device
   Have them enter the user_code received in step 2
   ```

4. **Get Access Token**
   - Use the "Get Access Token (Device)" request
   - Set these parameters:
     - client_id (from step 1)
     - device_code (from step 2)
     - grant_type: "http://oauth.net/grant_type/device/1.0"
   - Response will contain:
     ```json
     {
       "access_token": "TOKEN_HERE",
       "expires_in": 3600,
       "refresh_token": "REFRESH_TOKEN_HERE",
       "token_type": "Bearer"
     }
     ```

### Web Authentication Flow

1. **Register Your Application**
   ```
   Visit: https://real-debrid.com/apitoken
   Click: "Click here to manage your applications"
   Create new application
   Save the client_id and client_secret
   ```

2. **Authorization Request**
   - Use the "Web Authorization" request
   - Parameters:
     - client_id
     - redirect_uri (must match registered URI)
     - response_type: "code"
     - state: random string

3. **Handle Redirect**
   ```
   User will be redirected to your redirect_uri with:
   ?code=AUTH_CODE&state=YOUR_STATE
   ```

4. **Exchange Code for Token**
   ```http
   POST {{AUTH_URL}}/token
   Content-Type: application/x-www-form-urlencoded

   client_id={{CLIENT_ID}}
   client_secret={{CLIENT_SECRET}}
   code=AUTH_CODE
   grant_type=authorization_code
   redirect_uri={{REDIRECT_URI}}
   ```

### Environment Setup
Once you have these values, set them in your Postman environment:
```json
{
  "CLIENT_ID": "your_client_id",
  "CLIENT_SECRET": "your_client_secret", // Web only
  "ACCESS_TOKEN": "your_access_token",
  "DEVICE_CODE": "your_device_code" // Mobile only
}
```
