"""
JWT Authentication Service — Lightweight auth for API protection.
"""
import jwt
import datetime
import functools
from flask import request, jsonify
from config import Config


class AuthService:
    """Handle JWT token creation and verification."""

    @staticmethod
    def generate_token(user_id: str, role: str = "customer") -> str:
        """Generate a JWT token for a user."""
        payload = {
            "user_id": user_id,
            "role": role,
            "iat": datetime.datetime.utcnow(),
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=Config.JWT_EXPIRY_HOURS),
        }
        return jwt.encode(payload, Config.JWT_SECRET, algorithm=Config.JWT_ALGORITHM)

    @staticmethod
    def verify_token(token: str) -> dict:
        """Verify and decode a JWT token. Returns payload or None."""
        try:
            payload = jwt.decode(token, Config.JWT_SECRET, algorithms=[Config.JWT_ALGORITHM])
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None

    @staticmethod
    def get_token_from_request() -> str:
        """Extract Bearer token from Authorization header."""
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            return auth_header[7:]
        return None


def require_auth(f):
    """Decorator: require valid JWT to access an endpoint."""
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        token = AuthService.get_token_from_request()
        if not token:
            return jsonify({"error": "Missing authentication token", "code": "AUTH_REQUIRED"}), 401

        payload = AuthService.verify_token(token)
        if not payload:
            return jsonify({"error": "Invalid or expired token", "code": "AUTH_INVALID"}), 401

        # Attach user info to request context
        request.auth_user = payload
        return f(*args, **kwargs)

    return decorated


def optional_auth(f):
    """Decorator: attach user info if token present, but don't require it."""
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        token = AuthService.get_token_from_request()
        if token:
            payload = AuthService.verify_token(token)
            request.auth_user = payload
        else:
            request.auth_user = None
        return f(*args, **kwargs)

    return decorated
