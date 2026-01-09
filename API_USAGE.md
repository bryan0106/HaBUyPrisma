# API Usage Guide for Frontend

## Base URL

- **Development**: `http://localhost:3001/api`
- **Production**: (Update this when you deploy your API)

## CORS Configuration

The API allows requests from:
- `http://localhost:3000` (Local frontend)
- `https://han-b-uy.vercel.app` (Production frontend)
- `https://han-b-uy.vercel.app/store` (Production store page)

## BoxTypes API Endpoints

### Get All Box Types
```javascript
// GET /api/box-types
fetch('http://localhost:3001/api/box-types')
  .then(response => response.json())
  .then(data => {
    console.log('Success:', data);
    // data structure: { success: true, data: [...] }
  })
  .catch(error => console.error('Error:', error));
```

### Get Box Type by ID
```javascript
// GET /api/box-types/:id
const boxTypeId = '7da70375-b561-4c7a-a38...'; // Replace with actual ID
fetch(`http://localhost:3001/api/box-types/${boxTypeId}`)
  .then(response => response.json())
  .then(data => {
    console.log('Success:', data);
    // data structure: { success: true, data: {...} }
  })
  .catch(error => console.error('Error:', error));
```

### Get Box Type by Code
```javascript
// GET /api/box-types/code/:code
fetch('http://localhost:3001/api/box-types/code/SHARED')
  .then(response => response.json())
  .then(data => {
    console.log('Success:', data);
    // data structure: { success: true, data: {...} }
  })
  .catch(error => console.error('Error:', error));
```

### Create Box Type
```javascript
// POST /api/box-types
fetch('http://localhost:3001/api/box-types', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    code: 'NEW_TYPE',
    name: 'New Type Name',
    description: 'Optional description',
    color: '#FF5733', // Optional
  }),
})
  .then(response => response.json())
  .then(data => {
    console.log('Success:', data);
    // data structure: { success: true, data: {...} }
  })
  .catch(error => console.error('Error:', error));
```

### Update Box Type
```javascript
// PUT /api/box-types/:id
const boxTypeId = '7da70375-b561-4c7a-a38...'; // Replace with actual ID
fetch(`http://localhost:3001/api/box-types/${boxTypeId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Updated Name',
    description: 'Updated description',
    color: '#00FF00',
  }),
})
  .then(response => response.json())
  .then(data => {
    console.log('Success:', data);
    // data structure: { success: true, data: {...} }
  })
  .catch(error => console.error('Error:', error));
```

### Delete Box Type
```javascript
// DELETE /api/box-types/:id
const boxTypeId = '7da70375-b561-4c7a-a38...'; // Replace with actual ID
fetch(`http://localhost:3001/api/box-types/${boxTypeId}`, {
  method: 'DELETE',
})
  .then(response => response.json())
  .then(data => {
    console.log('Success:', data);
    // data structure: { success: true, message: 'Box type deleted successfully' }
  })
  .catch(error => console.error('Error:', error));
```

## React/Next.js Example (TypeScript)

```typescript
// utils/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface BoxType {
  id: string;
  code: string;
  name: string;
  description: string | null;
  color: string | null;
  created_at: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export const boxTypesApi = {
  // Get all box types
  getAll: async (): Promise<BoxType[]> => {
    const response = await fetch(`${API_BASE_URL}/box-types`);
    const result: ApiResponse<BoxType[]> = await response.json();
    if (!result.success || !result.data) {
      throw new Error(result.message || 'Failed to fetch box types');
    }
    return result.data;
  },

  // Get by ID
  getById: async (id: string): Promise<BoxType> => {
    const response = await fetch(`${API_BASE_URL}/box-types/${id}`);
    const result: ApiResponse<BoxType> = await response.json();
    if (!result.success || !result.data) {
      throw new Error(result.message || 'Box type not found');
    }
    return result.data;
  },

  // Get by code
  getByCode: async (code: string): Promise<BoxType> => {
    const response = await fetch(`${API_BASE_URL}/box-types/code/${code}`);
    const result: ApiResponse<BoxType> = await response.json();
    if (!result.success || !result.data) {
      throw new Error(result.message || 'Box type not found');
    }
    return result.data;
  },

  // Create
  create: async (data: {
    code: string;
    name: string;
    description?: string;
    color?: string;
  }): Promise<BoxType> => {
    const response = await fetch(`${API_BASE_URL}/box-types`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result: ApiResponse<BoxType> = await response.json();
    if (!result.success || !result.data) {
      throw new Error(result.message || 'Failed to create box type');
    }
    return result.data;
  },

  // Update
  update: async (id: string, data: Partial<BoxType>): Promise<BoxType> => {
    const response = await fetch(`${API_BASE_URL}/box-types/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result: ApiResponse<BoxType> = await response.json();
    if (!result.success || !result.data) {
      throw new Error(result.message || 'Failed to update box type');
    }
    return result.data;
  },

  // Delete
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/box-types/${id}`, {
      method: 'DELETE',
    });
    const result: ApiResponse<void> = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to delete box type');
    }
  },
};
```

## React Component Example

```typescript
'use client'; // For Next.js App Router

import { useEffect, useState } from 'react';
import { boxTypesApi, type BoxType } from '@/utils/api';

export default function BoxTypesList() {
  const [boxTypes, setBoxTypes] = useState<BoxType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBoxTypes() {
      try {
        setLoading(true);
        const data = await boxTypesApi.getAll();
        setBoxTypes(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load box types');
      } finally {
        setLoading(false);
      }
    }

    fetchBoxTypes();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Box Types</h1>
      <ul>
        {boxTypes.map((boxType) => (
          <li key={boxType.id}>
            <div>
              <strong>{boxType.name}</strong> ({boxType.code})
              {boxType.description && <p>{boxType.description}</p>}
              {boxType.color && (
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    backgroundColor: boxType.color,
                    display: 'inline-block',
                  }}
                />
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Response Format

All API responses follow this format:

**Success Response:**
```json
{
  "success": true,
  "data": { ... } // or [ ... ] for arrays
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error message (in development)"
}
```

## Environment Variables for Frontend

Add to your frontend `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

For production, update to your deployed API URL.

