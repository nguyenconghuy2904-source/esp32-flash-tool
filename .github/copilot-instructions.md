<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## ESP32-S3 Web Flash Tool Project

This project is a web application for flashing firmware to ESP32-S3 devices with key-based authentication.

### Project Requirements
- **Target**: ESP32-S3 microcontroller flashing via web interface  
- **Authentication**: Unique key system (one key per device)
- **Technology Stack**: Next.js 15.5 with TypeScript and Tailwind CSS
- **Features**: File upload, device connection, firmware flashing, key validation

### Development Guidelines
- Use secure key validation system via API routes
- Implement WebSerial API for direct browser-device communication
- Create responsive user interface with Tailwind CSS
- Ensure proper TypeScript typing and error handling
- Follow Next.js 15 best practices with App Router

### Architecture
- **Frontend**: React components with TypeScript
- **Backend**: Next.js API routes for key validation
- **Communication**: WebSerial API for ESP32-S3 connection
- **Styling**: Tailwind CSS for responsive design
- **Build**: Next.js with Turbopack for fast development

### Key Features Implemented
- ✅ WebSerial API integration for ESP32-S3 communication
- ✅ Key-based authentication system with backend validation  
- ✅ File upload interface for .bin firmware files
- ✅ Real-time progress tracking during firmware flashing
- ✅ Responsive UI with Vietnamese language support
- ✅ TypeScript definitions for WebSerial API
- ✅ Error handling and user feedback system