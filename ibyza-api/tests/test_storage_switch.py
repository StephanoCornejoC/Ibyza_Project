from django.test import TestCase, override_settings


class StorageSwitchTest(TestCase):
    """Verifica que el switch entre R2 y filesystem funciona."""

    def test_default_uses_filesystem_when_no_r2_env(self):
        """Sin env vars R2, debe usar FileSystemStorage."""
        from django.core.files.storage import default_storage, FileSystemStorage
        # En tests las vars R2 no estan seteadas, deberia ser filesystem.
        self.assertIsInstance(default_storage, FileSystemStorage)

    def test_use_r2_flag_reflects_env(self):
        """USE_R2 settings flag debe ser False sin credenciales."""
        from django.conf import settings
        self.assertFalse(settings.USE_R2)
