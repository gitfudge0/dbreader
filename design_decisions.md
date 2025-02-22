## Me

> Sharing:
>
> - <file>postman/collection.json</file>

Act as a senior React native developer with greate UI/UX experience. I want you to build an app that makes use of the postman collection I have provided in the context. You will not provide any code until I say so. We will brainstorm the solution and build the app from scratch through discussion. You will put forth important design decisions to me to decide how to build the app. Here are the initial list of requirements -

1. User should be able to view the list of torrents fetched from the API
2. User should be able to view details about each torrent item
3. User should be able to unrestrict links in each torrent item
4. User should be able to download unrestricted links
5. User should be able to stream links if mimetype is media item
6. User should be able to cast to devices in their local network
7. User should be able to add torrent magnet link and start torrent download
8. User should be able to delete torrent item(s)

Any other requirements you may think are relevant may be suggested by you. Find the API collection in the context.

Before we start designing the app, let's make sure you understand the requirement.

## CodeCompanion (Anthropic)

I'll analyze the requirements and the provided Real-Debrid API collection to ensure we're aligned on the project scope.

Key Observations from API Collection:

1. Authentication is OAuth2.0 based with device code flow
2. Main API endpoints cover:
   - Torrents management (list, add, info)
   - Unrestrict links
   - Downloads management
   - Streaming capabilities with transcoding

Important Design Considerations to Discuss:

1. Authentication & Security:

- How should we handle token storage?
- Should we implement auto-refresh for tokens?
- Do we need a login screen or direct device code flow?

2. UI/UX Architecture:

- Bottom tab navigation vs drawer navigation?
- Dark/Light theme support?
- Should we use a list or grid view for torrents?
- How to handle different media types (video, audio, archives)?

3. State Management:

- Redux vs Context API vs other solutions?
- How to handle background downloads?
- Real-time torrent status updates?

4. Technical Considerations:

- Minimum supported iOS/Android versions?
- How to handle large lists (pagination)?
- Local storage strategy for download management?
- Which media player library for streaming?
- Which casting library (Google Cast, AirPlay)?

Additional Feature Suggestions:

1. Download queue management
2. Download progress notifications
3. Batch operations for torrents/downloads
4. Favorite/bookmark system
5. History tracking
6. Storage management
7. Network bandwidth controls
8. Offline access to downloaded content

Which aspect would you like to discuss first to start shaping the app's architecture?

## Me

> Sharing:
>
> - <file>postman/collection.json</file>
>   Good, I think you have a good handle on the requirements. Let's discuss the app architecture. Ask me questions about various parts of the app that would require decision making.

## CodeCompanion (Anthropic)

I'll break down the key architectural decisions we need to make. Let's go through them systematically:

1. Navigation Structure:

- How would you prefer to organize the main navigation?
  Options:
  - Bottom tabs with main sections (Torrents, Downloads, Settings)
  - Drawer navigation with more menu items
  - Tab navigation + drawer for additional options

2. State Management:

- What's your preference for state management solution?
  Options:
  - Redux (with Redux Toolkit)
  - MobX
  - Zustand
  - React Context API
  - Jotai/Recoil

3. API Layer:

- How should we structure the API communication?
  Options:
  - React Query (with caching and real-time updates)
  - RTK Query
  - Custom Axios setup
  - Apollo Client (if considering GraphQL wrapper)

4. Storage Strategy:

- What's your preferred approach for local storage?
  Options:
  - AsyncStorage for basic data
  - SQLite for complex data
  - MMKV for performance
  - Realm Database

5. Authentication Flow:

- How should we implement the auth flow?
  Options:
  - Separate auth stack
  - Modal-based auth
  - In-screen auth flow

6. UI Component Library:

- Should we use a specific UI library or custom components?
  Options:
  - React Native Paper
  - Native Base
  - Custom components with styled-components
  - React Native Elements

Let's start with these fundamental decisions. Which aspect would you like to address first?

Also, would you like to see a proposed folder structure based on your choices? This would help us visualize the app organization better.

## Me

1. Navigation Structure:

- Bottom tabs with main sections (Torrents, Downloads, Settings)

2. State Management:

- Zustand

3. API Layer:

- React Query (with caching and real-time updates)

4. Storage Strategy:
   Which would be the best option in your opinion?

5. Authentication Flow:
   For now, we'll use a hardcoded bearer access token. End goal is to allow user to paste/store their token on the device securely, and change it via settings.

6. UI Component Library:

- React Native Paper

## CodeCompanion (Anthropic)

For the Storage Strategy, given our requirements and the choices you've made, I would recommend **MMKV** for the following reasons:

1. Performance: MMKV is significantly faster than AsyncStorage and SQLite
2. Perfect for our use case where we need to store:
   - Authentication token
   - User preferences
   - Download states
   - Cached torrent information
3. Easy to implement encryption for sensitive data
4. Small footprint compared to SQLite
5. Works well with Zustand for persistence

Now that we have these decisions, let me outline the core architecture:

```
📁 src/
├── 📁 api/
│   ├── queries/           # React Query hooks
│   ├── mutations/         # React Query mutations
│   ├── client.ts         # API client configuration
│   └── endpoints.ts      # API endpoint definitions
│
├── 📁 store/
│   ├── auth.ts           # Zustand auth store
│   ├── downloads.ts      # Downloads management store
│   └── settings.ts       # App settings store
│
├── 📁 navigation/
│   ├── AppNavigator.tsx  # Bottom tab navigator
│   ├── TorrentStack.tsx  # Torrent screen stack
│   ├── DownloadStack.tsx # Downloads screen stack
│   └── SettingsStack.tsx # Settings screen stack
│
├── 📁 screens/
│   ├── 📁 torrents/
│   ├── 📁 downloads/
│   └── 📁 settings/
│
├── 📁 components/
│   ├── 📁 common/        # Reusable components
│   ├── 📁 torrents/     # Torrent-specific components
│   └── 📁 downloads/    # Download-specific components
│
├── 📁 utils/
│   ├── storage.ts        # MMKV wrapper
│   ├── constants.ts      # App constants
│   └── helpers.ts        # Helper functions
│
└── 📁 theme/
    └── index.ts          # React Native Paper theme
```

Key Technical Decisions to Confirm:

1. Should we implement background download capability using react-native-background-fetch?
2. For media streaming, should we use react-native-video or expo-av?
3. For casting, should we support both Google Cast and AirPlay, or focus on one first?
4. Do you want to implement deep linking for magnet URLs?

Also, shall we start with creating the project structure and implementing the basic navigation setup?

## Me

1. Yes
2. expo-av
3. Google Cast. I should be able to cast to any android tv.
4. No.

## CodeCompanion (Anthropic)

Great, those decisions help clarify our technical scope. Before we start coding, let me outline the key features and their implementation approach for your confirmation:

**Main Screens & Features:**

1. **Torrents Tab:**

   - List View with:
     - Torrent name, size, status
     - Progress indicator for active downloads
     - Quick actions (unrestrict, delete)
   - FAB for adding new magnet link
   - Pull-to-refresh
   - Infinite scroll pagination

2. **Downloads Tab:**

   - Segmented view:
     - Active Downloads
     - Completed Downloads
   - Background download tracking
   - Download progress notifications
   - Media preview thumbnails
   - Casting button for media files

3. **Settings Tab:**
   - API token management
   - Download preferences
     - Parallel download limit
     - Network type restrictions
   - Cast settings
   - Storage management
   - Theme toggle

**Technical Implementation Plan:**

1. **Background Downloads:**

   ```
   react-native-background-fetch
   └── Download Queue Manager
       ├── Queue State (Zustand)
       ├── Download Progress Tracking
       └── Notification System
   ```

2. **Media Streaming:**

   ```
   expo-av
   └── Custom Video Player
       ├── Basic Controls
       ├── Quality Selection
       └── Cast Integration
   ```

3. **Casting Implementation:**
   ```
   react-native-google-cast
   └── Cast Manager
       ├── Device Discovery
       ├── Media Router
       └── Session Management
   ```

Would you like to:

1. Start with the project setup and basic navigation?
2. See the detailed component structure for any specific screen?
3. Review the proposed Zustand store structure?
4. Discuss the API integration strategy with React Query?

Choose what you'd like to explore first, and I'll provide more detailed information.

## Me

> Sharing:
>
> - <file>models/Torrents.model.ts</file>
> - <file>models/Downloads.model.ts</file>
> - <file>models/Unrestrict.model.ts</file>

Let me provide the model files that show you an idea of how torrents, downloads, and unrestricted items will look. Change the screen designs accordingly.

## CodeCompanion (Anthropic)

Thank you for providing the models. This helps refine our UI/UX design. Let me update the screen designs based on these models:

**1. Torrents Tab:**

```typescript
interface TorrentListScreen {
  listItem: {
    primary: TorrentModel.TorrentItem['filename']
    secondary: {
      status: TorrentModel.TorrentItem['status']
      size: formatBytes(TorrentModel.TorrentItem['bytes'])
      added: formatDate(TorrentModel.TorrentItem['added'])
    }
    progress: TorrentModel.TorrentItem['progress']
    actions: {
      unrestrict: () => void  // When status is 'downloaded'
      delete: () => void
    }
  }
}

interface TorrentDetailScreen {
  header: {
    filename: string
    hash: string
    size: string
    status: string
  }
  progress: number
  links: {
    original: string[]
    unrestricted: UnrestrictModel.UnrestrictedItem[]
  }
  timeline: {
    added: string
    ended?: string
  }
}
```

**2. Downloads Tab:**

```typescript
interface DownloadsListScreen {
  sections: {
    active: {
      downloadItem: {
        primary: DownloadsModel.DownloadItem['filename']
        secondary: {
          size: formatBytes(DownloadsModel.DownloadItem['filesize'])
          type: DownloadsModel.DownloadItem['mimeType']
        }
        progress: number // From background download tracking
        hostIcon: DownloadsModel.DownloadItem['host_icon']
        actions: {
          pause: () => void
          resume: () => void
          cancel: () => void
        }
      }
    }
    completed: {
      downloadItem: {
        primary: DownloadsModel.DownloadItem['filename']
        secondary: {
          size: formatBytes(DownloadsModel.DownloadItem['filesize'])
          date: formatDate(DownloadsModel.DownloadItem['generated'])
        }
        thumbnail?: string // For media files
        streamable: boolean // Based on DownloadsModel.DownloadItem['streamable']
        actions: {
          cast: () => void  // If streamable
          delete: () => void
          share: () => void
        }
      }
    }
  }
}
```

Key UI Updates Based on Models:

1. Add host icons in download items
2. Add mime-type based icons/thumbnails
3. Streamable indicator for media files
4. Progress tracking for both torrents and downloads
5. Detailed timeline for torrent processes

Would you like to:

1. See the visual mockups for these screens?
2. Review the Zustand store structure based on these models?
3. Look at the React Query implementation for these endpoints?
4. Start with implementing any specific screen?

## Me

> Sharing:
>
> - <file>models/Torrents.model.ts</file>
> - <file>models/Downloads.model.ts</file>
> - <file>models/Unrestrict.model.ts</file>

Here's another change - torrents won't be download on device. Torrent downloads will be handled in some other server. Only downloads we will do is from the unrestricted file items.

Here's how the general flow works -

Torrent is added
Some server takes care of torrent download
Restricted link gets available in torrents api
Call the unrestrict API to get downloadable link
Download using that link
Here, it can also be URLs that contain media - these will be played using the video or audio player.

## CodeCompanion (Anthropic)

Ah, this clarifies the flow significantly. Let me revise the architecture based on this flow:

**Main Flow:**

```
1. Add Torrent (magnet/hash) → API
2. Monitor Torrent Status → API Polling/WebSocket
3. When status = 'downloaded':
   └── Get restricted links from torrent
   └── Unrestrict links → Get UnrestrictedItem
   └── Based on UnrestrictedItem.mimeType:
       ├── Media (video/audio) → Stream/Cast
       └── Other files → Download
```

**Updated Screen Designs:**

1. **Torrents Tab:**

```typescript
interface TorrentListScreen {
  listItem: {
    primary: TorrentModel.TorrentItem['filename']
    secondary: {
      status: TorrentModel.TorrentItem['status']
      size: formatBytes(TorrentModel.TorrentItem['bytes'])
      added: formatDate(TorrentModel.TorrentItem['added'])
    }
    progress: TorrentModel.TorrentItem['progress'] // Server-side progress
    actions: {
      viewLinks: () => void  // When status is 'downloaded'
      delete: () => void
    }
  }
}

interface TorrentLinksScreen {
  header: TorrentInfo
  links: {
    listItem: {
      filename: string
      actions: {
        unrestrict: () => void
        stream?: () => void  // For media files
        download?: () => void // For non-media files
      }
    }
  }
}
```

2. **Downloads Tab:**

```typescript
interface DownloadsScreen {
  sections: {
    mediaLibrary: {
      // Streamable content from unrestricted links
      item: {
        title: string;
        thumbnail?: string;
        duration?: number;
        actions: {
          play: () => void;
          cast: () => void;
        };
      };
    };
    activeDownloads: {
      // Only for non-media unrestricted files
      item: {
        filename: string;
        progress: number;
        size: string;
        actions: {
          pause: () => void;
          resume: () => void;
          cancel: () => void;
        };
      };
    };
  };
}
```

**Key Changes:**

1. Remove torrent download management
2. Add media library section for streamable content
3. Downloads only handle non-media files
4. Add unrestrict step before download/stream
5. Separate handling for media vs non-media content

Would you like to:

1. Review the updated Zustand store structure for this flow?
2. See how we'll handle media streaming vs downloads?
3. Look at the React Query implementation for status polling?
4. Start implementing a specific part of this flow?

## Me

> Sharing:
>
> - <file>models/Torrents.model.ts</file>
> - <file>models/Downloads.model.ts</file>
> - <file>models/Unrestrict.model.ts</file>

Let's do points 1, 2, 3

## CodeCompanion (Anthropic)

I'll break down each point:

**1. Zustand Store Structure:**

```typescript
// torrentStore.ts
interface TorrentStore {
  // State
  selectedTorrent: TorrentModel.TorrentItem | null;
  unrestrictedLinks: Record<string, UnrestrictModel.UnrestrictedItem[]>;

  // Actions
  setSelectedTorrent: (torrent: TorrentModel.TorrentItem | null) => void;
  cacheUnrestrictedLinks: (
    torrentId: string,
    links: UnrestrictModel.UnrestrictedItem[],
  ) => void;
  clearUnrestrictedLinks: (torrentId: string) => void;
}

// mediaStore.ts
interface MediaStore {
  // State
  currentMedia: UnrestrictModel.UnrestrictedItem | null;
  playbackStatus: "idle" | "loading" | "playing" | "paused" | "error";
  castSession: boolean;

  // Actions
  setCurrentMedia: (media: UnrestrictModel.UnrestrictedItem | null) => void;
  updatePlaybackStatus: (status: PlaybackStatus) => void;
  setCastSession: (active: boolean) => void;
}

// downloadStore.ts
interface DownloadStore {
  // State
  activeDownloads: Record<
    string,
    {
      item: UnrestrictModel.UnrestrictedItem;
      progress: number;
      status: "queued" | "downloading" | "paused" | "completed" | "error";
    }
  >;

  // Actions
  addDownload: (item: UnrestrictModel.UnrestrictedItem) => void;
  updateProgress: (id: string, progress: number) => void;
  updateStatus: (id: string, status: DownloadStatus) => void;
  removeDownload: (id: string) => void;
}
```

**2. Media Streaming vs Downloads Handler:**

```typescript
// mediaHandler.ts
class MediaHandler {
  private player: Video; // expo-av Video component
  private castClient: GoogleCast;

  async handleMedia(item: UnrestrictModel.UnrestrictedItem) {
    if (item.streamable) {
      if (this.castSession) {
        await this.handleCast(item);
      } else {
        await this.handleLocalPlayback(item);
      }
    } else {
      await this.handleDownload(item);
    }
  }

  private async handleLocalPlayback(item: UnrestrictModel.UnrestrictedItem) {
    // Setup expo-av player
    return {
      uri: item.download,
      headers: { Authorization: `Bearer ${token}` },
    };
  }

  private async handleCast(item: UnrestrictModel.UnrestrictedItem) {
    // Setup Google Cast
    return {
      mediaInfo: {
        contentUrl: item.download,
        contentType: item.mimeType,
        metadata: {
          title: item.filename,
        },
      },
    };
  }

  private async handleDownload(item: UnrestrictModel.UnrestrictedItem) {
    // Handle non-media downloads
    downloadStore.addDownload(item);
    // Start background download
  }
}
```

**3. React Query Implementation:**

```typescript
// queries/torrents.ts
export const useTorrents = () => {
  return useQuery({
    queryKey: ["torrents"],
    queryFn: () => api.getTorrents(),
    refetchInterval: 5000, // Poll every 5 seconds
  });
};

export const useTorrentDetails = (id: string) => {
  return useQuery({
    queryKey: ["torrent", id],
    queryFn: () => api.getTorrentDetails(id),
    enabled: !!id,
  });
};

// mutations/torrents.ts
export const useAddTorrent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (magnet: string) => api.addTorrent(magnet),
    onSuccess: () => {
      queryClient.invalidateQueries(["torrents"]);
    },
  });
};

// queries/unrestrict.ts
export const useUnrestrictLink = () => {
  return useMutation({
    mutationFn: (link: string) => api.unrestrictLink(link),
    onSuccess: (data, link) => {
      // Update torrentStore with unrestricted link
      torrentStore.cacheUnrestrictedLinks(data.id, [data]);
    },
  });
};

// Background polling manager
const usePollingManager = () => {
  const { data: torrents } = useTorrents();

  useEffect(() => {
    const inProgressTorrents = torrents?.filter(
      (t) => t.status !== "downloaded" && t.status !== "error",
    );

    if (inProgressTorrents?.length) {
      // Adjust polling interval based on number of active torrents
      setPollingInterval(Math.max(2000, inProgressTorrents.length * 1000));
    } else {
      // Reset to default interval
      setPollingInterval(5000);
    }
  }, [torrents]);
};
```

Key Features:

1. Automatic polling for torrent status
2. Caching of unrestricted links
3. Separate handling for media and downloads
4. Cast integration
5. Background download management

Would you like to:

1. Start implementing any specific part?
2. See the component structure for media playback?
3. Review the error handling strategy?

## Me

> Sharing:
>
> - <file>models/Torrents.model.ts</file>
> - <file>models/Downloads.model.ts</file>
> - <file>models/Unrestrict.model.ts</file>

# Pending

1. **Background Tasks & Downloads:**

```typescript
// Background download management
- Download queue system
- Background task scheduling
- Download progress notifications
- File system management for downloads
```

2. **Media Playback Infrastructure:**

```typescript
// Media player setup
- Video/Audio player configuration
- Casting setup (Google Cast)
- Media controls
- Background playback
- Picture-in-Picture support
```

3. **Local Storage & Caching:**

```typescript
// Cache management
- Media thumbnails caching
- API response caching
- Download history
- User preferences
```

4. **Device Features:**

```typescript
// Device capabilities
- Network type detection
- Storage space management
- Cast device discovery
- File sharing capabilities
```

5. **Error Handling & Logging:**

```typescript
// Global error handling
- API error handling
- Crash reporting
- Analytics
- Performance monitoring
```

6. **Security:**

```typescript
- Secure token storage
- File access permissions
- Network security
```

# Current state

PROJECT: Real-Debrid Mobile Client
TECH STACK: React Native, TypeScript
CURRENT IMPLEMENTATION STATUS:

1. STATE MANAGEMENT

- Implemented Zustand stores:
  - torrentStore: Manages torrent listings and unrestricted links cache
  - mediaStore: Handles media playback state and queue
  - downloadStore: Manages download progress and status

2. API INTEGRATION

- Set up React Query with the following endpoints:

Torrents:

- GET /torrents
- GET /torrents/info/{id}
- POST /torrents/addMagnet
- DELETE /torrents/delete/{id}

Unrestrict:

- POST /unrestrict/link
- POST /unrestrict/folder
- GET /unrestrict/check
- GET /streaming/mediaInfos/{id}

Downloads:

- GET /downloads
- List downloads
- DELETE /downloads/delete/{id}
- GET /downloads/info/{id}

3. INFRASTRUCTURE

- API client setup with axios
- React Query provider configuration
- Network state management
- App state handling
- Error interceptors

4. CORE FUNCTIONALITY FLOW:
   a. Torrents Management:
   - List viewing
   - Adding via magnet
   - Status monitoring
   - Deletion

b. Link Processing:

- Unrestricting links
- Media info fetching
- Link availability checking

c. Downloads:

- List management
- Status tracking
- Download operations

PENDING IMPLEMENTATIONS:

1. UI/UX Components
2. Background Download System
3. Media Playback Infrastructure
4. Caching System
5. Device Features Integration
6. Security Implementation
7. Error Handling & Logging

The application uses a bottom tab navigation with three main sections:

- Torrents
- Downloads
- Settings

Current focus has been on setting up the core infrastructure and state management. The UI implementation and additional features are pending.
