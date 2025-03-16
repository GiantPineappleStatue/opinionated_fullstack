export const UNAUTHORIZED_ERROR = 'Unauthorized';
export const FORBIDDEN_ERROR = 'Forbidden';
export const NOT_FOUND_ERROR = 'Not Found';
export const SERVER_ERROR = 'Server Error';

export const handleHttpErrors = async (response: Response): Promise<never> => {
  let errorMessage: string;

  try {
    const errorData = await response.json();
    errorMessage = errorData.message || `HTTP Error ${response.status}`;
  } catch {
    errorMessage = `HTTP Error ${response.status}`;
  }

  switch (response.status) {
    case 401:
      throw new Error(UNAUTHORIZED_ERROR);
    case 403:
      throw new Error(FORBIDDEN_ERROR);
    case 404:
      throw new Error(NOT_FOUND_ERROR);
    case 500:
      throw new Error(SERVER_ERROR);
    default:
      throw new Error(errorMessage);
  }
}; 