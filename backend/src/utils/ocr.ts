import axios from 'axios';

const MINDEE_API_KEY = process.env.MINDEE_API_KEY || '';
const MINDEE_API_URL = 'https://api.mindee.net/v1/products/mindee/expense_receipts/v5/predict';

export interface ReceiptData {
  merchant?: string;
  category?: string;
  date?: string;
  total?: number;
  currency?: string;
  confidence?: number;
  items?: Array<{
    description: string;
    quantity?: number;
    unitPrice?: number;
    totalAmount?: number;
  }>;
}

/**
 * Extract receipt data using Mindee OCR
 * @param imageUrl - URL of receipt image
 * @returns Extracted receipt data
 */
export const extractReceiptData = async (imageUrl: string): Promise<ReceiptData> => {
  try {
    // Call Mindee API
    const response = await axios.post(
      MINDEE_API_URL,
      {
        document: imageUrl,
      },
      {
        headers: {
          Authorization: `Token ${MINDEE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = response.data.document.inference.prediction;

    // Map category based on merchant or items
    const merchant = data.supplier_name?.value || data.supplier?.value || 'Unknown';
    const category = categorizeReceipt(merchant, data.line_items || []);

    return {
      merchant,
      category,
      date: data.date?.value || data.time?.value,
      total: parseFloat(data.total_amount?.value || data.total_incl?.value || '0'),
      currency: data.locale?.currency || 'USD',
      confidence: calculateConfidence(data),
      items: (data.line_items || []).map((item: any) => ({
        description: item.description || '',
        quantity: parseFloat(item.quantity || '1'),
        unitPrice: parseFloat(item.unit_price || '0'),
        totalAmount: parseFloat(item.total_amount || '0'),
      })),
    };
  } catch (error: any) {
    console.error('OCR extraction error:', error.response?.data || error.message);

    // Return default values if OCR fails
    return {
      merchant: 'Unknown',
      category: 'Other',
      total: 0,
      confidence: 0,
    };
  }
};

/**
 * Categorize receipt based on merchant name and items
 */
function categorizeReceipt(merchant: string, items: any[]): string {
  const merchantLower = merchant.toLowerCase();

  // Electronics
  if (
    merchantLower.includes('apple') ||
    merchantLower.includes('best buy') ||
    merchantLower.includes('microcenter') ||
    merchantLower.includes('newegg') ||
    merchantLower.includes('amazon') ||
    merchantLower.includes('electronics')
  ) {
    return 'Electronics';
  }

  // Grocery
  if (
    merchantLower.includes('walmart') ||
    merchantLower.includes('target') ||
    merchantLower.includes('costco') ||
    merchantLower.includes('kroger') ||
    merchantLower.includes('safeway') ||
    merchantLower.includes('whole foods') ||
    merchantLower.includes('trader joe') ||
    merchantLower.includes('grocery') ||
    merchantLower.includes('market')
  ) {
    return 'Grocery';
  }

  // Restaurant
  if (
    merchantLower.includes('restaurant') ||
    merchantLower.includes('cafe') ||
    merchantLower.includes('pizza') ||
    merchantLower.includes('burger') ||
    merchantLower.includes('grill') ||
    merchantLower.includes('kitchen') ||
    merchantLower.includes('mcdonald') ||
    merchantLower.includes('starbucks') ||
    merchantLower.includes('dunkin')
  ) {
    return 'Restaurant';
  }

  // Retail
  if (
    merchantLower.includes('macy') ||
    merchantLower.includes('nordstrom') ||
    merchantLower.includes('gap') ||
    merchantLower.includes('old navy') ||
    merchantLower.includes('tj maxx') ||
    merchantLower.includes('ross') ||
    merchantLower.includes('store')
  ) {
    return 'Retail';
  }

  return 'Other';
}

/**
 * Calculate overall confidence score from Mindee response
 */
function calculateConfidence(data: any): number {
  const confidences: number[] = [];

  if (data.total_amount?.confidence) confidences.push(data.total_amount.confidence);
  if (data.supplier_name?.confidence) confidences.push(data.supplier_name.confidence);
  if (data.date?.confidence) confidences.push(data.date.confidence);

  if (confidences.length === 0) return 0;

  const avg = confidences.reduce((sum, val) => sum + val, 0) / confidences.length;
  return Math.round(avg * 100) / 100;
}

/**
 * Validate receipt data quality
 */
export function validateReceiptData(data: ReceiptData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.total || data.total <= 0) {
    errors.push('Receipt total amount is missing or invalid');
  }

  if (data.confidence && data.confidence < 0.5) {
    errors.push('OCR confidence is too low (< 50%)');
  }

  if (!data.merchant || data.merchant === 'Unknown') {
    errors.push('Merchant name could not be identified');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
