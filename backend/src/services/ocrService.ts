import Tesseract from 'tesseract.js';
import sharp from 'sharp';

interface ReceiptData {
  merchant?: string;
  amount?: number;
  date?: string;
  category?: string;
  items?: string[];
  rawText: string;
  confidence: number;
}

/**
 * OCR Service for extracting data from receipt images
 */
export class OCRService {
  /**
   * Preprocess image for better OCR accuracy
   */
  private async preprocessImage(imageBuffer: Buffer): Promise<Buffer> {
    try {
      return await sharp(imageBuffer)
        .greyscale()
        .normalize()
        .sharpen()
        .toBuffer();
    } catch (error) {
      console.error('Image preprocessing failed:', error);
      return imageBuffer; // Return original if preprocessing fails
    }
  }

  /**
   * Extract text from receipt image using Tesseract OCR
   */
  private async extractText(imageBuffer: Buffer): Promise<{ text: string; confidence: number }> {
    const preprocessed = await this.preprocessImage(imageBuffer);

    const { data } = await Tesseract.recognize(preprocessed, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    return {
      text: data.text,
      confidence: data.confidence,
    };
  }

  /**
   * Parse merchant name from receipt text
   */
  private parseMerchant(text: string): string | undefined {
    const lines = text.split('\n').filter(line => line.trim().length > 0);

    // Common merchant patterns (usually first few lines)
    const merchantPatterns = [
      /^([A-Z][A-Za-z\s&]{2,30})/,
      /(TARGET|WALMART|COSTCO|WHOLE FOODS|TRADER JOE|SAFEWAY|KROGER|PUBLIX)/i,
      /(STARBUCKS|DUNKIN|MCDONALD|BURGER KING|CHIPOTLE|SUBWAY)/i,
      /(BEST BUY|APPLE|AMAZON|HOME DEPOT|LOWE'S)/i,
    ];

    for (const line of lines.slice(0, 5)) {
      for (const pattern of merchantPatterns) {
        const match = line.match(pattern);
        if (match) {
          return match[0].trim();
        }
      }
    }

    // Fallback: return first non-empty line
    return lines[0]?.trim();
  }

  /**
   * Parse total amount from receipt text
   */
  private parseAmount(text: string): number | undefined {
    // Look for total amount patterns
    const amountPatterns = [
      /TOTAL[\s:$]*(\d+[.,]\d{2})/i,
      /AMOUNT[\s:$]*(\d+[.,]\d{2})/i,
      /BALANCE[\s:$]*(\d+[.,]\d{2})/i,
      /\$\s*(\d+[.,]\d{2})/,
    ];

    for (const pattern of amountPatterns) {
      const match = text.match(pattern);
      if (match) {
        const amount = parseFloat(match[1].replace(',', ''));
        if (amount > 0 && amount < 10000) { // Sanity check
          return amount;
        }
      }
    }

    return undefined;
  }

  /**
   * Parse date from receipt text
   */
  private parseDate(text: string): string | undefined {
    const datePatterns = [
      /(\d{1,2}\/\d{1,2}\/\d{2,4})/,
      /(\d{1,2}-\d{1,2}-\d{2,4})/,
      /(\d{4}-\d{2}-\d{2})/,
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        try {
          const date = new Date(match[1]);
          if (date.toString() !== 'Invalid Date') {
            return date.toISOString();
          }
        } catch {
          continue;
        }
      }
    }

    return new Date().toISOString(); // Default to today
  }

  /**
   * Determine receipt category based on merchant and content
   */
  private categorizeReceipt(merchant: string = '', text: string): string {
    const merchantLower = merchant.toLowerCase();
    const textLower = text.toLowerCase();

    // Grocery stores
    if (/(whole foods|trader joe|safeway|kroger|publix|albertsons|food lion)/i.test(merchantLower)) {
      return 'grocery';
    }

    // Electronics
    if (/(best buy|apple|micro center|frys|newegg)/i.test(merchantLower)) {
      return 'electronics';
    }

    // Restaurants & Fast Food
    if (/(starbucks|dunkin|mcdonald|burger king|chipotle|subway|restaurant|cafe)/i.test(merchantLower)) {
      return 'restaurant';
    }

    // Retail
    if (/(target|walmart|costco|amazon|home depot)/i.test(merchantLower)) {
      return 'retail';
    }

    // Pharmacy
    if (/(cvs|walgreens|rite aid|pharmacy)/i.test(merchantLower)) {
      return 'pharmacy';
    }

    // Default to retail
    return 'retail';
  }

  /**
   * Calculate earnings based on category and amount
   */
  public calculateEarnings(amount: number, category: string): number {
    const rates: { [key: string]: number } = {
      grocery: 0.0008,      // $0.08 per $100
      electronics: 0.020,   // $2.00 per $100
      restaurant: 0.0003,   // $0.03 per $100
      retail: 0.0012,       // $0.12 per $100
      pharmacy: 0.0015,     // $0.15 per $100
    };

    const rate = rates[category] || 0.0005;
    const earnings = amount * rate;

    // Round to 2 decimal places
    return Math.round(earnings * 100) / 100;
  }

  /**
   * Main method to process receipt image and extract data
   */
  public async processReceipt(imageBuffer: Buffer): Promise<ReceiptData> {
    try {
      // Extract text using OCR
      const { text, confidence } = await this.extractText(imageBuffer);

      // Parse receipt data
      const merchant = this.parseMerchant(text);
      const amount = this.parseAmount(text);
      const date = this.parseDate(text);
      const category = this.categorizeReceipt(merchant, text);

      // Extract items (simplified - just non-empty lines that look like items)
      const items = text
        .split('\n')
        .filter(line => {
          const trimmed = line.trim();
          return trimmed.length > 3 && /[a-zA-Z]/.test(trimmed);
        })
        .slice(0, 20); // Limit to first 20 items

      return {
        merchant,
        amount,
        date,
        category,
        items,
        rawText: text,
        confidence: Math.round(confidence),
      };
    } catch (error) {
      console.error('OCR processing failed:', error);
      throw new Error('Failed to process receipt image');
    }
  }

  /**
   * Validate if image is a valid receipt
   */
  public async validateReceipt(imageBuffer: Buffer): Promise<{ valid: boolean; reason?: string }> {
    try {
      const { text, confidence } = await this.extractText(imageBuffer);

      // Check confidence level
      if (confidence < 30) {
        return { valid: false, reason: 'Image quality too low. Please retake photo.' };
      }

      // Check for common receipt indicators
      const hasAmount = /\$\s*\d+[.,]\d{2}/.test(text);
      const hasTotal = /total/i.test(text);
      const hasDate = /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(text);

      if (!hasAmount && !hasTotal) {
        return { valid: false, reason: 'No receipt data found. Make sure entire receipt is visible.' };
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, reason: 'Failed to read image. Please try again.' };
    }
  }
}

export const ocrService = new OCRService();
