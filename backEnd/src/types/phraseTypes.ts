export interface UserPhrase {
    id: number;
    userId: number;
    phrase: string;
    dateReceived: string; // Format: YYYY-MM-DD
    totalPhrases: number;
}