# Hiomi AI Frontend - Detect Page Integration Setup

This guide explains how to set up the detect page to work with your Spring Boot upload service and ML result service.

## Configuration

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Upload Service (Spring Boot) - Default: http://localhost:8080
NEXT_PUBLIC_UPLOAD_SERVICE_URL=http://localhost:8080

# ML Result Service - Default: http://localhost:8085
NEXT_PUBLIC_ML_RESULT_SERVICE_URL=http://localhost:8085
```

### API Endpoints

The detect page expects the following endpoints:

1. **Upload Service** (`NEXT_PUBLIC_UPLOAD_SERVICE_URL`):

   - `POST /upload` - Accepts multipart file uploads
   - Expected parameters: `file` (MultipartFile)
   - Returns: `"Uploaded"` on success

2. **ML Result Service** (`NEXT_PUBLIC_ML_RESULT_SERVICE_URL`):
   - `GET /stream` - Server-Sent Events endpoint for live updates
   - `GET /results?userId={userId}&filename={filename}` - Polling endpoint for results

## Integration Features

### 1. File Upload

- Supports JPG, PNG, and DICOM files
- Maximum file size: 20MB
- Drag-and-drop interface
- Progress indication during upload

### 2. Result Handling

The detect page implements two methods for receiving ML results:

#### Option A: Server-Sent Events (SSE) - Preferred

- Real-time updates via EventSource
- Automatically falls back to polling if SSE fails
- Listens for `ml-result` events

#### Option B: Polling - Fallback

- Polls the results endpoint every 2 seconds
- Stops polling once a result is received
- Maximum polling duration: 1 minute

### 3. Expected ML Result Format

The ML result service should return data in this format:

```json
{
  "filename": "example.jpg",
  "userId": "1",
  "contentType": "image/jpeg",
  "size": 123456,
  "result": {
    "prediction": "pneumonia",
    "confidence": 0.847,
    "probabilities": {
      "pneumonia": 0.847,
      "normal": 0.132,
      "other": 0.021
    }
  }
}
```

## Usage

1. Start your Spring Boot upload service on port 8080
2. Start your ML result service on port 8085
3. Start the Next.js frontend: `npm run dev`
4. Navigate to `/detect` page
5. Upload an X-ray image
6. The page will automatically handle the upload and wait for ML results

## Error Handling

- Upload failures are displayed to the user
- SSE connection failures automatically fall back to polling
- Network errors are logged to the console
- Timeout handling for long-running ML processes

## Customization

You can modify the configuration in `lib/config.ts`:

- Change polling intervals
- Adjust file size limits
- Modify accepted file types
- Update default user ID

## Troubleshooting

1. **CORS Issues**: Ensure your Spring Boot service allows requests from `http://localhost:3000`
2. **SSE Not Working**: Check that your ML result service supports Server-Sent Events
3. **Upload Fails**: Verify the upload endpoint accepts multipart form data
4. **No Results**: Check the browser console for network errors or incorrect response format


