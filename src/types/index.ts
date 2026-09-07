export interface Book {
  id: string;
  title: string;
  author: string;
  authors?: string[];
  cover?: string;
  coverUrl?: string;
  cover_url?: string;
  description?: string;
  source: string;
  download_url?: string;
  previewLink?: string;
  webReaderLink?: string;
  categories?: string[];
  publishedDate?: string;
  pageCount?: number;
  language?: string;
  rating?: number;
  publishedYear?: number;
}

export interface User {
  uid: string;
  email: string;
  name: string;
  photoURL?: string | null;
  provider: string;
}

export interface ReadingProgress {
  [bookId: string]: number | string;
}

export interface ReaderSettings {
  fontSize: number;
  theme: 'dark' | 'light' | 'sepia';
  lineHeight: number;
}

export interface AppState {
  activeTab: string;
  books: Book[];
  selectedBook: Book | null;
  isLoading: boolean;
  errorMsg: string;
  user: User | null;
  readlist: Book[];
  readingProgress: ReadingProgress;
  recommendations: Book[];
  isReading: boolean;
}

export interface BookModalProps {
  book: Book | null;
  onClose: () => void;
  onToggleReadlist: () => void;
  isInReadlist: boolean;
  onReadBook: () => void;
}

export interface ReaderViewProps {
  book: Book;
  location?: number | string;
  onLocationChanged: (bookId: string, location: number | string) => void;
  onClose: () => void;
}

export interface BookCardProps {
  book: Book;
  onBookSelect: (book: Book) => void;
  onReadBook?: (book: Book) => void;
  isInReadlist?: boolean;
  onToggleReadlist?: (book: Book) => void;
}

export interface SearchViewProps {
  onBookSelect: (book: Book) => void;
}

export interface CatalogViewProps {
  onBookSelect: (book: Book) => void;
}

export interface HomeViewProps {
  books: Book[];
  recommendations: Book[];
  isLoading: boolean;
  errorMsg: string;
  onBookSelect: (book: Book) => void;
  onReadBook: (book: Book) => void;
}

export interface BookshelfViewProps {
  user: User;
  readlist: Book[];
  readingProgress: ReadingProgress;
  onLogout: () => void;
  onBookSelect: (book: Book) => void;
  onReadBook: (book: Book) => void;
}

export interface RankingsViewProps {
  onBookSelect: (book: Book) => void;
  onReadBook: (book: Book) => void;
}

export interface WebImportViewProps {
  onBookSelect: (book: Book) => void;
  onReadBook: (book: Book) => void;
  onAddToReadlist: (book: Book) => void;
  isInReadlist: (bookId: string) => boolean;
}

export interface LoginViewProps {
  onLogin: (user: User) => void;
}

export interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}