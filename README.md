1. Split Fair-DDP - Group Expense Manager
Split Fair-DDP is a cross-platform mobile application designed to simplify group financial management. It automates bill splitting, tracks shared expenses, and ensures transparency among group members using smart AI-powered receipt scanning.

2. 🚀 Tech Stack (Front-end)
Framework: React Native (Expo SDK 53) - High-performance cross-platform development for Android and iOS.

Navigation: Expo Router - File-based routing system for seamless screen transitions.

State & Data Fetching: React Query (TanStack) - Efficient server-state management, caching, and synchronization.

Authentication: Firebase Auth - Integrated with Google Sign-In for secure user access.

AI Integration: OCR.space API (Engine 2) - Specialized engine for high-accuracy numeric and receipt text recognition.

Deployment: EAS (Expo Application Services) - Professional build pipeline for .aab (Android App Bundle) distribution.

3.  Key Features
3.1. Smart Receipt Scanning (AI OCR)
Users can take a photo or upload a receipt from the gallery. The system automatically extracts the Total Amount, reducing manual entry errors and saving time.

3.2. Flexible Splitting Methods
The app supports four distinct calculation modes to ensure fairness:

Equally (EQUAL): Evenly distributes the cost among all selected members.

Exact Amount (EXACT): Assigns specific currency values to individuals.

Percentage (%): Splits based on custom percentage ratios.

Shares (SHARES): Splits based on proportional parts (e.g., 2 shares for an adult, 1 for a child).

3.3. Intelligent Auto-Balancing Logic
Powered by the useExpenseCreation hook, the app distinguishes between Manual and Auto inputs. If a user manually edits a specific member's share, the system automatically recalibrates the remaining balance among the other "Auto" members to ensure the total matches the bill.
4. 💡 Technical Implementation Highlights
Currency Formatting (formatNumber)
The application utilizes Intl.NumberFormat('vi-VN') to handle Vietnamese Dong (VND) formatting. It automatically inserts dot separators (e.g., 1.000.000) for enhanced readability.

Core Logic Hook
The useExpenseCreation hook serves as the application's "brain." It utilizes useMemo and useEffect to trigger recalculations whenever the amount or splitMethod changes, ensuring real-time UI updates with zero lag.

Build Optimization
During the production phase, the build size was optimized from 532MB down to approximately 10MB by implementing a strict .easignore policy, excluding unnecessary native directories and node_modules from the cloud build process.

5. 📦 Getting Started
Clone the repository:

Bash
git clone https://github.com/tan_duy0805/split-fair-ddp.git
Install dependencies:

Bash
npm install
Setup Environment: Create a .env file with your Firebase and OCR.space API keys.

Run the app:

Bash
npx expo start
6. 🎓 Team
Tan Duy - Lead Front-end Developer: Core Logic, OCR Integration, and DevOps (EAS Build/Google Play Console).
