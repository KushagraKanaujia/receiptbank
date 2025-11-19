describe('Utility Functions', () => {
  describe('Email Validation', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    it('should validate correct email formats', () => {
      const validEmails = [
        'user@example.com',
        'test.user@example.co.uk',
        'user+tag@example.com',
        'user_name@example.org',
      ];

      validEmails.forEach(email => {
        expect(email).toMatch(emailRegex);
      });
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'notanemail',
        '@example.com',
        'user@',
        'user @example.com',
        'user@.com',
      ];

      invalidEmails.forEach(email => {
        expect(email).not.toMatch(emailRegex);
      });
    });
  });

  describe('Password Strength', () => {
    const isStrongPassword = (password: string) => {
      return password.length >= 8 &&
             /[A-Z]/.test(password) &&
             /[a-z]/.test(password) &&
             /[0-9]/.test(password);
    };

    it('should validate strong passwords', () => {
      const strongPasswords = [
        'SecurePass123',
        'MyP@ssw0rd',
        'Testing123',
      ];

      strongPasswords.forEach(password => {
        expect(isStrongPassword(password)).toBe(true);
      });
    });

    it('should reject weak passwords', () => {
      const weakPasswords = [
        'short',
        'alllowercase123',
        'ALLUPPERCASE123',
        'NoNumbers',
      ];

      weakPasswords.forEach(password => {
        expect(isStrongPassword(password)).toBe(false);
      });
    });
  });

  describe('Price Calculation', () => {
    const calculateEarnings = (amount: number, category: string) => {
      const rates: { [key: string]: number } = {
        grocery: 0.08,
        electronics: 2.00,
        restaurant: 0.03,
        retail: 0.12,
        pharmacy: 0.15,
      };

      const baseRate = rates[category] || 0.05;
      return Number((amount * baseRate * 0.01).toFixed(2));
    };

    it('should calculate correct earnings for different categories', () => {
      expect(calculateEarnings(50, 'grocery')).toBeGreaterThan(0);
      expect(calculateEarnings(100, 'electronics')).toBeGreaterThan(calculateEarnings(100, 'grocery'));
      expect(calculateEarnings(50, 'restaurant')).toBeGreaterThan(0);
    });

    it('should handle edge cases', () => {
      expect(calculateEarnings(0, 'grocery')).toBe(0);
      expect(calculateEarnings(100, 'unknown')).toBeGreaterThan(0);
    });

    it('should return numbers with 2 decimal places', () => {
      const earnings = calculateEarnings(99.99, 'retail');
      expect(earnings.toString()).toMatch(/^\d+\.\d{1,2}$/);
    });
  });

  describe('Date Utilities', () => {
    it('should validate date formats', () => {
      const validDate = '2024-01-15T10:30:00Z';
      const dateObj = new Date(validDate);

      expect(dateObj.toString()).not.toBe('Invalid Date');
      expect(dateObj.getFullYear()).toBe(2024);
    });

    it('should calculate date differences', () => {
      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-01-31');
      const diffDays = Math.floor((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24));

      expect(diffDays).toBe(30);
    });

    it('should handle timezone conversions', () => {
      const now = new Date();
      const isoString = now.toISOString();

      expect(isoString).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('Data Sanitization', () => {
    const sanitizeHTML = (input: string) => {
      return input.replace(/<[^>]*>/g, '');
    };

    it('should remove HTML tags', () => {
      const maliciousInput = '<script>alert("xss")</script>Hello';
      const sanitized = sanitizeHTML(maliciousInput);

      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toBe('alert("xss")Hello');
    });

    it('should handle nested tags', () => {
      const input = '<div><p>Text</p></div>';
      const sanitized = sanitizeHTML(input);

      expect(sanitized).toBe('Text');
    });
  });

  describe('Amount Formatting', () => {
    const formatCurrency = (amount: number) => {
      return `$${amount.toFixed(2)}`;
    };

    it('should format amounts correctly', () => {
      expect(formatCurrency(10)).toBe('$10.00');
      expect(formatCurrency(10.5)).toBe('$10.50');
      expect(formatCurrency(10.555)).toBe('$10.56');
    });

    it('should handle large amounts', () => {
      expect(formatCurrency(1000000)).toBe('$1000000.00');
    });

    it('should handle small amounts', () => {
      expect(formatCurrency(0.01)).toBe('$0.01');
      expect(formatCurrency(0.1)).toBe('$0.10');
    });
  });

  describe('Array Utilities', () => {
    it('should deduplicate arrays', () => {
      const duplicates = [1, 2, 2, 3, 3, 3, 4];
      const unique = [...new Set(duplicates)];

      expect(unique).toEqual([1, 2, 3, 4]);
      expect(unique.length).toBe(4);
    });

    it('should sort arrays correctly', () => {
      const unsorted = [3, 1, 4, 1, 5, 9, 2, 6];
      const sorted = [...unsorted].sort((a, b) => a - b);

      expect(sorted[0]).toBe(1);
      expect(sorted[sorted.length - 1]).toBe(9);
    });

    it('should filter arrays', () => {
      const numbers = [1, 2, 3, 4, 5, 6];
      const evens = numbers.filter(n => n % 2 === 0);

      expect(evens).toEqual([2, 4, 6]);
    });
  });

  describe('String Utilities', () => {
    it('should capitalize strings', () => {
      const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('WORLD')).toBe('World');
    });

    it('should truncate long strings', () => {
      const truncate = (str: string, maxLength: number) => {
        return str.length > maxLength ? str.slice(0, maxLength) + '...' : str;
      };

      expect(truncate('This is a long string', 10)).toBe('This is a ...');
      expect(truncate('Short', 10)).toBe('Short');
    });
  });

  describe('Validation Helpers', () => {
    it('should validate required fields', () => {
      const hasRequiredFields = (obj: any, fields: string[]) => {
        return fields.every(field => field in obj && obj[field] != null);
      };

      const validObj = { name: 'Test', email: 'test@test.com', age: 25 };
      const invalidObj = { name: 'Test', email: 'test@test.com' };

      expect(hasRequiredFields(validObj, ['name', 'email', 'age'])).toBe(true);
      expect(hasRequiredFields(invalidObj, ['name', 'email', 'age'])).toBe(false);
    });

    it('should validate number ranges', () => {
      const isInRange = (num: number, min: number, max: number) => {
        return num >= min && num <= max;
      };

      expect(isInRange(5, 1, 10)).toBe(true);
      expect(isInRange(0, 1, 10)).toBe(false);
      expect(isInRange(11, 1, 10)).toBe(false);
    });
  });
});
