import catchErrors from '../../utils/catchErrors.util';
import { NextFunction, Request, Response } from 'express';

describe('Utility: catchErrors()', () => {
  const mockRequest = {} as Request;
  const mockResponse = {} as Response;
  const mockNext = jest.fn() as NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call the controller successfully', async () => {
    const mockController = jest.fn().mockResolvedValue('success');
    const wrappedController = catchErrors(mockController);

    await wrappedController(mockRequest, mockResponse, mockNext);

    expect(mockController).toHaveBeenCalledWith(
      mockRequest,
      mockResponse,
      mockNext,
    );
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should catch errors and forward to error handler', async () => {
    const testError = new Error('Test error');
    const mockController = jest.fn().mockRejectedValue(testError);
    const wrappedController = catchErrors(mockController);

    await wrappedController(mockRequest, mockResponse, mockNext);

    expect(mockController).toHaveBeenCalledWith(
      mockRequest,
      mockResponse,
      mockNext,
    );
    expect(mockNext).toHaveBeenCalledWith(testError);
  });

  it('should handle synchronous errors in controller', async () => {
    const testError = new Error('Sync error');
    const mockController = jest.fn().mockImplementation(() => {
      throw testError;
    });
    const wrappedController = catchErrors(mockController);

    await wrappedController(mockRequest, mockResponse, mockNext);

    expect(mockNext).toHaveBeenCalledWith(testError);
  });
});
