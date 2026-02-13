class AppError(Exception):
    """Base application error."""
    pass


class NotFoundError(AppError):
    """Resource not found."""
    pass


class ConflictError(AppError):
    """Duplicate / already exists."""
    pass


class ValidationError(AppError):
    """Business rule or input validation failure."""
    pass