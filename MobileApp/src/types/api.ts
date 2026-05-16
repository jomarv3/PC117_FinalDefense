export interface ApiValidationErrors {
  [key: string]: string[];
}

export interface ApiError {
  status?: number;
  message: string;
  errors?: ApiValidationErrors;
  raw?: unknown;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  profile_image?: string | null;
  profile_image_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  expires_at: string;
  role: string;
  role_label: string;
  mobile_features: string[];
}

export interface RegisterResponse {
  message: string;
  user: AuthUser;
  role: string;
  role_label: string;
}

export interface MeResponse {
  user: AuthUser;
  role: string;
  role_label: string;
  mobile_features: string[];
}

export interface BookTransaction {
  id: number;
  borrower_name: string | null;
  borrow_date: string | null;
  due_date: string | null;
  return_date: string | null;
  status: string | null;
}

export interface BookDetails {
  id: number;
  title: string;
  author: string;
  category: string | null;
  library_reference: string;
  isbn: string | null;
  book_isbn?: string | null;
  quantity: number;
  available_quantity: number;
  status: string;
  image_url: string | null;
  qr_url: string | null;
  recent_transactions?: BookTransaction[];
}
