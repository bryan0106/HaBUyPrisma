# Frontend Integration Prompt

## Quick Integration Instructions

### For Your Frontend Developer/AI Assistant:

**I need to integrate the BoxTypes API into my frontend application. Here's what I need:**

1. **API Endpoint**: `http://localhost:3001/api/box-types`
   - The API is running on port 3001
   - CORS is already configured to allow requests from `http://localhost:3000` and `https://han-b-uy.vercel.app`

2. **Available Endpoints:**
   - `GET /api/box-types` - Get all box types
   - `GET /api/box-types/:id` - Get box type by ID
   - `GET /api/box-types/code/:code` - Get box type by code (e.g., "SHARED", "SOLO")

3. **Response Format:**
   ```json
   {
     "success": true,
     "data": [...]
   }
   ```

4. **Box Type Data Structure:**
   ```typescript
   interface BoxType {
     id: string;              // UUID
     code: string;            // Unique code (e.g., "SHARED", "SOLO")
     name: string;            // Display name
     description: string | null;
     color: string | null;    // Hex color code (e.g., "#108981")
     created_at: string | null;
   }
   ```

5. **Requirements:**
   - Create a utility function/service to fetch box types from the API
   - Display the box types in a component (list or cards)
   - Show the box type name, code, description, and color
   - Handle loading and error states
   - Use TypeScript if possible

6. **Example Usage:**
   ```javascript
   // Fetch all box types
   const response = await fetch('http://localhost:3001/api/box-types');
   const { success, data } = await response.json();
   if (success) {
     console.log('Box Types:', data);
   }
   ```

**Please create:**
- A service/utility function to call the BoxTypes API
- A React/Next.js component to display the box types
- Error handling and loading states
- TypeScript types/interfaces for type safety

**My frontend is running on `localhost:3000` and will be deployed to `https://han-b-uy.vercel.app/store`**

