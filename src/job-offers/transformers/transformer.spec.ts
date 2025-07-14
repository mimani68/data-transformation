import { TransformerHandler } from './transformer';
import { JobOfferType } from '../enums/job-offer-type.enum';

describe('TransformerHandler', () => {
  describe('transform', () => {
    it('should return error=true when data is null', () => {
      const result = TransformerHandler.prototype.transform(null, jest.fn());
      expect(result).toEqual({ error: true });
    });

    it('should return error=true when transformerFunction is null', () => {
      const result = TransformerHandler.prototype.transform({}, null);
      expect(result).toEqual({ error: true });
    });

    it('should return error=true when transformerFunction throws an error', () => {
      const faultyFn = () => { throw new Error('Test error'); };
      const result = TransformerHandler.prototype.transform({}, faultyFn);
      expect(result).toEqual({ error: true });
    });

    it('should return with error=false when transformerFunction succeeds', () => {
      const mockResult = { 
        result: 'data', 
        error: null, 
        missedKeys: [], 
        completeIds: [1], 
        defectedIds: [] 
      };
      const transformerFn = jest.fn().mockReturnValue(mockResult);
      
      const result = TransformerHandler.prototype.transform({}, transformerFn);
      expect(result).toEqual({ 
        error: false, 
        ...mockResult 
      });
    });

    it('should return with error when transformerFunction returns error', () => {
      const mockResult = { 
        error: 'Transform failed', 
        missedKeys: ['key'], 
        completeIds: [], 
        defectedIds: [2] 
      };
      const transformerFn = jest.fn().mockReturnValue(mockResult);
      
      const result = TransformerHandler.prototype.transform({}, transformerFn);
      expect(result).toEqual(mockResult);
    });
  });

  describe('mapJobType', () => {
    it('should map "full time" to JobOfferType.FULL_TIME', () => {
      expect(TransformerHandler.mapJobType('full time')).toBe(JobOfferType.FULL_TIME);
      expect(TransformerHandler.mapJobType('FULL TIME')).toBe(JobOfferType.FULL_TIME);
    });

    it('should map "part time" to JobOfferType.PART_TIME', () => {
      expect(TransformerHandler.mapJobType('part time')).toBe(JobOfferType.PART_TIME);
    });

    it('should map "contract" to JobOfferType.CONTRACT', () => {
      expect(TransformerHandler.mapJobType('contract')).toBe(JobOfferType.CONTRACT);
    });

    it('should map "internship" to JobOfferType.INTERNSHIP', () => {
      expect(TransformerHandler.mapJobType('internship')).toBe(JobOfferType.INTERNSHIP);
    });

    it('should default to FULL_TIME for unknown types', () => {
      expect(TransformerHandler.mapJobType('unknown')).toBe(JobOfferType.FULL_TIME);
    });
  });

  describe('parseSalary', () => {
    it('should parse min and max salary from range', () => {
      const result = TransformerHandler.parseSalary('$50,000 - $60,000');
      expect(result).toEqual({
        min: 50000,
        max: 60000,
        currency: 'USD'
      });
    });

    it('should handle "k" suffix (thousands)', () => {
      const result = TransformerHandler.parseSalary('$50k - $60k');
      expect(result).toEqual({
        min: 50000,
        max: 60000,
        currency: 'USD'
      });
    });

    it('should set max=min when only one value is present', () => {
      const result = TransformerHandler.parseSalary('$75,000');
      expect(result).toEqual({
        min: 75000,
        max: 75000,
        currency: 'USD'
      });
    });

    it('should handle k-suffix without range', () => {
      const result = TransformerHandler.parseSalary('$100k');
      expect(result).toEqual({
        min: 100000,
        max: 100000,
        currency: 'USD'
      });
    });

    it('should handle missing max value by setting max=min', () => {
      const result = TransformerHandler.parseSalary('$80,000 - ');
      expect(result).toEqual({
        min: 80000,
        max: 80000,
        currency: 'USD'
      });
    });

    it('should return nulls for unparsable input', () => {
      const result = TransformerHandler.parseSalary('invalid salary');
      expect(result).toEqual({
        min: null,
        max: null,
        currency: 'USD'
      });
    });
  });
});
