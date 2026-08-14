const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export interface Transaction {
  id: number;
  user_id: number;
  title: string;
  amount: number;
  transaction_type: "income" | "expense";
  category: string;
  description: string | null;
  created_at: string;
}

export interface CreateTransactionData {
  title: string;
  amount: number;
  transaction_type: "income" | "expense";
  category: string;
  description: string;
}

// Get JWT token
function getToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("access_token");
}

// ==============================
// GET ALL TRANSACTIONS
// ==============================

export async function getTransactions(): Promise<Transaction[]> {
  const token = getToken();

  if (!token) {
    throw new Error("Authentication token not found");
  }

  const response = await fetch(`${API_URL}/transactions/`, {
    method: "GET",

    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to load transactions");
  }

  return response.json();
}

// ==============================
// CREATE TRANSACTION
// ==============================

export async function createTransaction(
  data: CreateTransactionData
): Promise<Transaction> {
  const token = getToken();

  if (!token) {
    throw new Error("Authentication token not found");
  }

  const response = await fetch(`${API_URL}/transactions/`, {
    method: "POST",

    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },

    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(
      error?.detail || "Failed to create transaction"
    );
  }

  return response.json();
}

// ==============================
// DELETE TRANSACTION
// ==============================

export async function deleteTransaction(
  transactionId: number
): Promise<void> {
  const token = getToken();

  if (!token) {
    throw new Error("Authentication token not found");
  }

  const response = await fetch(
    `${API_URL}/transactions/${transactionId}`,
    {
      method: "DELETE",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(
      error?.detail || "Failed to delete transaction"
    );
  }
}