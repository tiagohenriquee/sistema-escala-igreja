import jwt
import pytest

from app.core.config import get_settings
from app.core.security import (
    create_access_token,
    decode_access_token,
    verify_credentials,
)


def test_verify_credentials_matches_settings():
    settings = get_settings()
    assert verify_credentials(settings.admin_username, settings.admin_password) is True


def test_verify_credentials_rejects_wrong_password():
    settings = get_settings()
    assert verify_credentials(settings.admin_username, "definitely-wrong") is False
    assert verify_credentials("intruder", settings.admin_password) is False


def test_token_roundtrip():
    token = create_access_token("admin")
    payload = decode_access_token(token)
    assert payload["sub"] == "admin"
    assert "exp" in payload


def test_token_with_wrong_secret_is_rejected():
    token = create_access_token("admin")
    with pytest.raises(jwt.PyJWTError):
        jwt.decode(token, "another-secret", algorithms=["HS256"])
